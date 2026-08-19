export const computePricing = (
  form = {},
  vehicleData = {},
  selectedDatesData = {},
  tradeInValue = 0
) => {

  const isSale = vehicleData?.type === "sale";
  const isRent = vehicleData?.type === "rent";

  const selectedDays =
    isRent &&
    selectedDatesData?.start &&
    selectedDatesData?.end
      ? Math.max(
          1,
          Math.ceil(
            (new Date(selectedDatesData.end) -
              new Date(selectedDatesData.start)) /
            (1000 * 60 * 60 * 24)
          ) + 1
        )
      : 1;

  const basePrice =
    isRent
      ? Number(vehicleData?.price || 0) * selectedDays
      : Number(vehicleData?.price || 0);

const selectedOptionIds = form?.optionsSelected ?? [];

const optionalPrice =
  (vehicleData?.optional_options ?? []).reduce((sum, option) => {

    if (!selectedOptionIds.includes(option.id)) {
      return sum;
    }

    const price = Number(option.price ?? 0);

    if (isRent && option.billing_type === "daily") {
      return sum + price * selectedDays;
    }

    return sum + price;

  }, 0);

  const totalPrice = basePrice + optionalPrice;

 const durationMonths = Number(form?.duration_months ?? 36);
const downPayment = Number(form?.down_payment ?? 0);
const discount = Number(form?.discount ?? 0);
  const rawFinancedAmount =
    totalPrice - downPayment - tradeInValue - discount;

  const financedAmount =
    Math.max(rawFinancedAmount, 0);

  const isInvalidFinance =
    rawFinancedAmount < 0;

  const isCash =
    financedAmount === 0;

const monthlyPayment =
  durationMonths > 0
    ? Math.round(
        (financedAmount / durationMonths) * 100
      ) / 100
    : 0;

  return {
    selectedDays,
    basePrice,
    optionalPrice,
    totalPrice,
    durationMonths,
    downPayment,
    financedAmount,
    rawFinancedAmount,
    isInvalidFinance,
    isCash,
    monthlyPayment,
    isSale,
    isRent
  };
};