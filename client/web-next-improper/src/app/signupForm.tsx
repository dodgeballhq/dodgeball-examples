'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Dodgeball,
    DodgeballApiVersion,
    useDodgeball
} from '@dodgeball/trust-sdk-client';

import './SignupForm.style.scss';

import { CACHE_TIME } from '@/const/cache';
import { SIGNUP_ROUTES } from '@/const/signup';
import { payPeriodToIterations } from '@/const/subscription';
import { RawEPCCCartResponse } from '@/types/Cart';
import { InsuranceProduct, SubscriptionProduct } from '@/types/Subscription';
import analytics from '@/util/analytics';
import {
    createUser,
    createUserRegistrationAddress,
    setSMSOptIn,
    updateMembership
} from '@/util/user_client';
import { sleep } from '@/util/misc';
import { attachPaymentMethod, createCustomer } from '@/util/stripe_client';

import { SignupState as RegistrationValues } from '@/types/Signup';

import { useUser } from '@/components/hook/user';
import { useSignup } from '@/components/hook/signup';

import SignupStep1Form, {
    SignupStep1FormValues
} from '../SignupStep1Form/SignupStep1Form';
import SignupStep2Form, {
    SignupStep2FormValues
} from '../SignupStep2Form/SignupStep2Form';
import SignupStep3Form, {
    SignupStep3FormValues
} from '../SignupStep3Form/SignupStep3Form';
import SignupStep4Form, {
    SignupStep4FormValues
} from '../SignupStep4Form/SignupStep4Form';
import SignupStep5Form, {
    SignupStep5FormValues
} from '../SignupStep5Form/SignupStep5Form';
import { ReferralCopyProps } from '@/components/common/SignUpApp/SignUpApp';
import { DodgeballProvider } from "@/components/context/DodgeballContext/DodgeballContext";

const dodgeballPublicApiKey =
    process.env.NEXT_PUBLIC_DODGEBALL_PUBLIC_API_KEY || '';
const dodgeballApiUrl = process.env.NEXT_PUBLIC_DODGEBALL_API_URL;

type SignupFormProps = {
    currentStep: number;
    subscriptionData: SubscriptionProduct[];
    insuranceData: InsuranceProduct[];
    planSelected: any;
    referralCopy?: ReferralCopyProps;
    user: RegistrationValues;
    previewCart?: RawEPCCCartResponse;
    payPeriodCopy: string;
};

/**
 *  See developerCookieJar.md for why this is a temporary but currently necessary evil,
 *  and should be done away with because a) ugly and b) bad
 **/
const deconstructInitialFormValues = (
    user: RegistrationValues
): {
    step1: SignupStep1FormValues;
    step2: SignupStep2FormValues;
    step3: SignupStep3FormValues;
    step4: SignupStep4FormValues;
    step5: SignupStep5FormValues;
} => {
    const step1InitialValues: SignupStep1FormValues = (({
                                                            email,
                                                            phone,
                                                            password,
                                                            referralCode,
                                                            optinPromotion,
                                                            optinText
                                                        }) => ({ email, phone, password, referralCode, optinPromotion, optinText }))(
        user
    );

    const step2InitialValues: SignupStep2FormValues = (({
                                                            firstName,
                                                            lastName,
                                                            birthday,
                                                            instagram,
                                                            tiktok
                                                        }) => ({ firstName, lastName, birthday, instagram, tiktok }))(user);

    const step3InitialValues: SignupStep3FormValues = (({
                                                            address,
                                                            aptUnitSuite,
                                                            city,
                                                            state,
                                                            postalCode
                                                        }) => ({ address, aptUnitSuite, city, state, postalCode }))(user);

    const step4InitialValues: SignupStep4FormValues = (({
                                                            creditCardLast4,
                                                            expirationDate,
                                                            sameAsShippingAddress,
                                                            stripePaymentMethodId,
                                                            stripePaymentMethodBrand,
                                                            billingAddress,
                                                            billingAptUnitSuite,
                                                            billingCity,
                                                            billingState,
                                                            billingPostalCode
                                                        }) => ({
        creditCardLast4,
        expirationDate,
        sameAsShippingAddress,
        stripePaymentMethodId,
        stripePaymentMethodBrand,
        billingAddress,
        billingAptUnitSuite,
        billingCity,
        billingState,
        billingPostalCode
    }))(user);

    const step5InitialValues: SignupStep5FormValues = (({
                                                            paymentAgreement,
                                                            terms
                                                        }) => ({ paymentAgreement, terms }))(user);

    return {
        step1: step1InitialValues,
        step2: step2InitialValues,
        step3: step3InitialValues,
        step4: step4InitialValues,
        step5: step5InitialValues
    };
};

export default function SignupForm(props: SignupFormProps) {
    const {
        currentStep,
        user,
        subscriptionData,
        insuranceData,
        previewCart,
        payPeriodCopy,
        referralCopy
    } = props;

    const router = useRouter();

    const { actions: userActions } = useUser();
    const { actions: signupActions } = useSignup();

    const [errorMessage, setErrorMessage] = useState<string | null>();
    const [submissionIsLoading, setSubmissionIsLoading] =
        useState<boolean>(false);

    let dodgeball: Dodgeball;
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        dodgeball = useDodgeball(dodgeballPublicApiKey, {
            apiVersion: DodgeballApiVersion.v1,
            apiUrl: dodgeballApiUrl
        });
    } catch (e) {
        console.error('Error loading Dodgeball', e);
    }

    const initialValues = deconstructInitialFormValues(user);

    const handleConfirmation = async (user: RegistrationValues) => {
        setErrorMessage(null);
        setSubmissionIsLoading(true);

        try {
            await registerUser(user);
            // userActions.login() will automatically identify the user
            // via Segment, since we are identifying them in UserContext
            await userActions.login(user.email, user.password);
            await setMembership(user);

            // If user opted into SMS, send to Braze
            if (user.optinText) {
                await setSMSOptIn(true);
            }

            // Unsubscribe the user from the marketing abandon list here
            await fetch('/api/marketing/abandon', {
                method: 'DELETE',
                next: { revalidate: CACHE_TIME.NO_CACHE },
                body: JSON.stringify({ email: user.email })
            });

            if (
                user.referralCode &&
                user.referralCode.includes(
                    process.env.NEXT_PUBLIC_CAKE_PROMO_PREFIX as string
                )
            ) {
                // Formatting Cake data for promo tracking with Segment
                const cakeDetails = {
                    checkout: {
                        discountApplications: [
                            {
                                // Referral data
                                title: user.referralCode,
                                type: 'Referral code',
                                value: {
                                    amount: 200,
                                    currencyCode: 'USD'
                                }
                            }
                        ],
                        lineItems: [
                            {
                                // Subscription data
                                id: user.plan?.id,
                                quantity: 1,
                                title: user.plan?.name
                            }
                        ]
                    }
                };

                analytics.track('Application - Submit Application', {
                    userName: `${user.firstName} ${user.lastName}`,
                    cakeDetails
                });
            } else {
                analytics.track('Application - Submit Application');
            }
        } catch (error: any) {
            console.error('[Application Submission Error]', error);

            if (error.cause === 'Stripe') {
                setErrorMessage(error.message);
            } else {
                setErrorMessage(
                    'There was an error, please check your selections and try again.'
                );
            }

            analytics.track('Application Submission Error', { error });
            setSubmissionIsLoading(false);
            return;
        }

        router.push(SIGNUP_ROUTES.SUCCESS);

        // Wait a bit before we reset, else the page may prematurely reload to first page of application
        await sleep(5000);

        signupActions.resetForm();

        // If user opted into SMS, refresh user so we can retrieve updated SMS settings
        // (Purposely refreshed after a delay to prevent race condition)
        if (user.optinText) {
            userActions.refresh();
        }
    };

    /**
     * Applies desired membership plans to user
     * @param user
     */
    const setMembership = async (user: RegistrationValues) => {
        // Compile membership selections
        const basePlanId = user.plan?.stripePlanId;
        const insurancePlanId = insuranceData.find(
            (plan) => plan.slug === user.insurance_level
        )?.stripePlanId;

        if (!basePlanId || !insurancePlanId) {
            // With form validation we should never get here, but if we do..setErrorMessage
            throw Error('Subscription and/or insurance plans not selected');
        }

        const subscriptionPlanIds = [basePlanId];

        const addonPlanId = subscriptionData.find(
            (plan) => plan.slug === user.addon_subscription
        )?.stripePlanId;

        if (addonPlanId) {
            subscriptionPlanIds.push(addonPlanId);
        }

        const prepayIterations = payPeriodToIterations[user.payPeriod];

        // Save user's subscription selections
        await updateMembership(
            subscriptionPlanIds,
            insurancePlanId,
            prepayIterations
        );
    };

    /**
     * Creates a new user from sign up flow.
     * Returns the EPCC userId
     */
    const registerUser = async (user: RegistrationValues): Promise<string> => {
        // Stripe Create Customer
        const customer = await createCustomer(user);

        // Stripe attach payment Method
        await attachPaymentMethod(user.stripePaymentMethodId, customer.id);

        // Get the source token from Dodgeball
        let sourceToken;
        try {
            sourceToken = await dodgeball.getSourceToken();
        } catch (e) {
            console.error('Error fetching Dodgeball getSourceToken()', e);
        }

        // Create EPCC users and addresses
        const createUserResponse = await createUser({
            user,
            stripe_customer_id: customer.id,
            card_type: user.stripePaymentMethodBrand,
            dodgeballSourceToken: sourceToken
        });

        const userId = createUserResponse?.data?.id;

        if (!userId) {
            console.error(createUserResponse);
            throw Error(`Failed to create a new user`);
        }

        await Promise.all([
            // Save user's shipping address
            createUserRegistrationAddress({
                user_id: userId,
                is_billing: false,
                user_info: user
            }),

            // Save user's billing address
            createUserRegistrationAddress({
                user_id: userId,
                is_billing: true,
                user_info: user
            })
        ]);

        return userId;
    };

    if (!!errorMessage && currentStep !== 4) {
        setErrorMessage(null);
    }

    return (
        <div className='SignupForm'>
            {currentStep === 0 && (
                <SignupStep1Form
                    key={1}
                    initialValues={initialValues.step1}
                    onSubmitSuccess={(values) => {
                        const payload = JSON.stringify({ email: values.email });
                        const requestOptions = {
                            method: 'POST',
                            body: payload,
                            next: { revalidate: CACHE_TIME.NO_CACHE }
                        };

                        // THIS IS A HACK.
                        // I don't know why, but doing just 1 API all to Braze doesn't work.
                        // Space out the calls between 10 seconds to get it working as expected
                        // A support ticket with Braze has been opened.

                        // No need to await the fetch here. Just let it go and die if it fails.
                        fetch('/api/marketing/abandon', requestOptions)
                            .then(() => {
                                return sleep(10000);
                            })
                            .then(() => {
                                fetch('/api/marketing/abandon', requestOptions);
                            })
                            .catch(() => {
                                // TODO: Put error in Sentry/DataDog/BugSnag whatever
                                console.error('Error when adding user to marketing AA list');
                            });

                        signupActions.updateFormValues(values);
                        analytics.track('Application - Start Application Finished');
                        router.push(SIGNUP_ROUTES.PERSONALIZE);
                    }}
                    referralCopy={referralCopy}
                    user={user}
                />
            )}

            {currentStep === 1 && (
                <SignupStep2Form
                    key={2}
                    initialValues={initialValues.step2}
                    onSubmitSuccess={(values) => {
                        signupActions.updateFormValues(values);
                        analytics.track('Application - Customer Information Finished');
                        router.push(SIGNUP_ROUTES.ADDRESS);
                    }}
                />
            )}

            {currentStep === 2 && (
                <SignupStep3Form
                    key={3}
                    initialValues={initialValues.step3}
                    onSubmitSuccess={(values) => {
                        signupActions.updateFormValues(values);
                        analytics.track('Application - Address Finished');
                        router.push(SIGNUP_ROUTES.BILLING);
                    }}
                />
            )}

            {currentStep === 3 && (
                <SignupStep4Form
                    key={4}
                    initialValues={initialValues.step4}
                    onSubmitSuccess={(values) => {
                        signupActions.updateFormValues(values);
                        analytics.track('Application - Payment Finished');
                        router.push(SIGNUP_ROUTES.REVIEW);
                    }}
                />
            )}

            {currentStep === 4 && (
                <SignupStep5Form
                    key={5}
                    initialValues={initialValues.step5}
                    user={user}
                    errorMessage={errorMessage}
                    subs={subscriptionData}
                    insuranceData={insuranceData}
                    previewCart={previewCart}
                    payPeriodCopy={payPeriodCopy}
                    referralCopy={referralCopy}
                    onSubmitSuccess={() => {
                        handleConfirmation(user);
                    }}
                    submissionIsLoading={submissionIsLoading}
                />
            )}
        </div>
    );
}
