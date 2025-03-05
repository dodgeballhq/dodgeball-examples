import { getApiAuthUser, IJwtPayload } from "@/lib/auth";
import { validPromos } from "@/lib/constants";
import { getCustomMessageFromVerification } from "@/lib/dodgeball-extensions/client-helpers";
import { executeDodgeballCheckpoint } from "@/lib/dodgeball-extensions/server-helpers";
import { IExecuteServerCheckpointRequest } from "@/lib/dodgeball-extensions/server-types";
import { NextRequest, NextResponse } from "next/server";
import { getRequestIp } from "../../ip";

interface BasePromoCode {
  code: string;
  category: "FIRST_PURCHASE" | "GENERAL";
}

interface PromoCodePercentageDiscount extends BasePromoCode {
  type: "percentage";
  percentage: number;
}

interface PromoCodeFixedDiscount extends BasePromoCode {
  type: "fixed";
  amount: number;
}

export type PromoCodeDiscount = PromoCodePercentageDiscount | PromoCodeFixedDiscount;

interface SuccessApplyPromoCodeResponse {
  success: true;
  discount: PromoCodeDiscount;
}

interface FailedApplyPromoCodeResponse {
  success: false;
  error: string;
}

export type ApplyPromoCodeResponse = SuccessApplyPromoCodeResponse | FailedApplyPromoCodeResponse;

export async function handleApplyPromoCode(
  promoCode: string,
  sourceToken: string,
  authPayload: IJwtPayload | null,
  requestIp: string
): Promise<PromoCodeDiscount> {
  const promoCodeDiscount = validPromos[promoCode];
  if (!promoCodeDiscount) {
    throw new Error("Invalid promo code");
  }
  const executeParams: IExecuteServerCheckpointRequest = {
    checkpointName: "APPLY_PROMO",
    payload: {
      promoCode,
      promoType: validPromos[promoCode].category,
    },
    sourceToken,
    userId: authPayload?.userId,
    sessionId: authPayload?.sessionId,
  };

  const executionResult = await executeDodgeballCheckpoint(executeParams, requestIp);

  if (executionResult.status === "isAllowed") {
    return promoCodeDiscount;
  }

  if (executionResult.status === "isDenied") {
    if (executionResult.verification) {
      const customMessage = getCustomMessageFromVerification(executionResult.verification);
      if (customMessage && typeof customMessage === "string") {
        throw new Error(customMessage);
      }
    }
    throw new Error("Promo code is not allowed");
  }

  if (executionResult.status === "isError" || executionResult.status === "isRunning") {
    console.error("Error applying promo code:", executionResult.errorMessage);
    throw new Error("Unable to apply promo code");
  }

  throw new Error("Unable to apply promo code");
}

export async function POST(req: NextRequest): Promise<NextResponse<ApplyPromoCodeResponse>> {
  let authPayload: IJwtPayload | null = null;
  try {
    authPayload = await getApiAuthUser(req);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { promoCode, sourceToken } = await req.json();
  const requestIp = getRequestIp(req);
  try {
    const discount = await handleApplyPromoCode(promoCode, sourceToken, authPayload, requestIp);
    return NextResponse.json({ success: true, discount }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unable to apply promo code";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 200 });
  }
}
