import { IAddress, ITransaction } from "@/lib/api/types";
import { UsersService } from "@/lib/api/users/service";
import { UserResponse } from "@/lib/api/users/types";
import { getApiAuthUser, IJwtPayload } from "@/lib/auth";
import { executeDodgeballCheckpoint, executeDodgeballEvent } from "@/lib/dodgeball-extensions/server-helpers";
import { IExecuteServerCheckpointRequest, IExecuteServerEventRequest } from "@/lib/dodgeball-extensions/server-types";
import { NextRequest, NextResponse } from "next/server";
import { getRequestIp } from "../../ip";
import { handleApplyPromoCode, PromoCodeDiscount } from "../../promo-code/apply/route";
interface CheckoutRequest {
  transaction: ITransaction;
  sourceToken: string;
}

interface SuccessCheckoutResponse {
  success: true;
}

interface FailedCheckoutResponse {
  success: false;
  error: string;
}

export type CheckoutResponse = SuccessCheckoutResponse | FailedCheckoutResponse;

export async function POST(req: NextRequest): Promise<NextResponse<CheckoutResponse>> {
  let authPayload: IJwtPayload | null = null;
  let authUser: UserResponse | null = null;
  const requestIp = getRequestIp(req);
  try {
    authPayload = await getApiAuthUser(req);
    authUser = await UsersService.getUserById(authPayload.userId);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unable to apply promo code" }, { status: 200 });
  }
  const { transaction, sourceToken } = (await req.json()) as CheckoutRequest;
  if (!transaction) {
    return NextResponse.json({ success: false, error: "Transaction is required" }, { status: 200 });
  }
  let promoCodeDiscount: PromoCodeDiscount | null = null;
  try {
    if (transaction.promoCode) {
      promoCodeDiscount = await handleApplyPromoCode(transaction.promoCode, sourceToken, authPayload, requestIp);
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unable to apply promo code" }, { status: 200 });
  }
  let shippingAddress: IAddress | null = null;
  if (!transaction.isDigitalDelivery) {
    if (!transaction.shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Shipping address is required for physical products" },
        { status: 200 }
      );
    }
    shippingAddress = {
      firstName: transaction.shippingAddress.firstName,
      lastName: transaction.shippingAddress.lastName,
      line1: transaction.shippingAddress.line1,
      line2: transaction.shippingAddress.line2,
      postalCode: transaction.shippingAddress.postalCode,
    };
  }

  const purchasePayload = {
    customer: {
      externalId: authUser?.id,
      primaryEmail: authUser?.email,
      primaryPhone: authUser?.phone,
      firstName: authUser?.firstName,
      lastName: authUser?.lastName,
    },
    transaction: {
      externalId: transaction.externalId,
      amount: transaction.amount * 100,
      currency: "USD",
      orderedFromDomain: "https://shopfire.dodgeballhq.com",
      lineItems: transaction.lineItems?.map((item) => ({
        unitAmount: item.unitPrice * 100,
        numUnits: item.quantity,
        product: {
          externalId: item.productId,
          name: item.name,
          description: item.description,
          brand: item.brand,
        },
      })),
      shipments: [
        {
          isExpedited: false,
          isDigitalDelivery: transaction.isDigitalDelivery,
          shippingAddress,
        },
      ],
    },
    paymentMethod: {
      type: "CARD_DEBIT",
      cardHolderName: transaction.cardHolderName,
      cardBin: transaction.cardBin,
      cardLast4: transaction.cardLast4,
    },
    billingAddress: {
      firstName: transaction.billingAddress.firstName,
      lastName: transaction.billingAddress.lastName,
      line1: transaction.billingAddress.line1,
      line2: transaction.billingAddress.line2,
      postalCode: transaction.billingAddress.postalCode,
    },
    siftSendEventCreateOrder: {
      inputs: {
        brandName: "Shopfire",
        siteCountry: "US",
      },
    },
    promoCode: promoCodeDiscount?.code,
    promoType: promoCodeDiscount?.category,
  };

  const executeParams: IExecuteServerCheckpointRequest = {
    checkpointName: "PURCHASE",
    payload: purchasePayload,
    sourceToken,
    sessionId: authPayload?.sessionId,
    userId: authPayload?.userId,
  };
  const baseEventPayload: Omit<IExecuteServerEventRequest, "eventName"> = {
    payload: purchasePayload,
    sourceToken,
    sessionId: authPayload?.sessionId,
    userId: authPayload?.userId,
  };

  try {
    const executionResult = await executeDodgeballCheckpoint(executeParams, requestIp);
    if (executionResult.status === "isAllowed") {
      executeDodgeballEvent({
        ...baseEventPayload,
        eventName: "PURCHASE_SUCCESS",
      });
      if (promoCodeDiscount) {
        executeDodgeballEvent({
          ...baseEventPayload,
          eventName: `PURCHASE_SUCCESS_WITH_PROMO_CODE_${promoCodeDiscount.code}`,
        });
        executeDodgeballEvent({
          ...baseEventPayload,
          eventName: `PURCHASE_SUCCESS_WITH_PROMO_CATEGORY_${promoCodeDiscount.category}`,
        });
      }
      return NextResponse.json(
        {
          success: true,
        },
        { status: 200 }
      );
    }

    if (executionResult.status === "isDenied") {
      executeDodgeballEvent({
        ...baseEventPayload,
        eventName: "PURCHASE_DENIED",
      });
      return NextResponse.json(
        {
          success: false,
          error: "Checkout denied",
        },
        { status: 200 }
      );
    }

    if (executionResult.status === "isError" || executionResult.status === "isRunning") {
      executeDodgeballEvent({
        ...baseEventPayload,
        eventName: "PURCHASE_ERROR",
      });
      console.error("Error during checkout:", executionResult.errorMessage);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to checkout",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    executeDodgeballEvent({
      ...baseEventPayload,
      eventName: "PURCHASE_ERROR",
    });
    console.error("Error during checkout:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to checkout",
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: "Unable to checkout",
    },
    { status: 200 }
  );
}
