export enum FinancialCategory {
  ACTIVE_INCOME = 'ACTIVE_INCOME',
  PASSIVE_INCOME = 'PASSIVE_INCOME',

  FOOD = 'FOOD',
  TRAVEL = 'TRAVEL',
  ENTERTAINMENT = 'ENTERTAINMENT',
  EDUCATION = 'EDUCATION',
  CLOTHING = 'CLOTHING',
  MISCELLANEOUS = 'MISCELLANEOUS'
}

export interface CategoryOption {
  value: FinancialCategory;
  label: string;
  description: string;
  icon: string;
}

export const INCOME_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: FinancialCategory.ACTIVE_INCOME,
    label: 'Active Income',
    description: 'Salary, business, freelance, commissions, and tips.',
    icon: 'briefcase'
  },
  {
    value: FinancialCategory.PASSIVE_INCOME,
    label: 'Passive Income',
    description: 'Investments, rental property, dividends, and royalties.',
    icon: 'trending-up'
  }
];

export const EXPENSE_CATEGORY_OPTIONS: CategoryOption[] = [
  { value: FinancialCategory.FOOD, label: 'Food', description: 'Meals, groceries, and dining out.', icon: 'utensils' },
  { value: FinancialCategory.TRAVEL, label: 'Travel', description: 'Trips, transit, and commuting.', icon: 'plane' },
  {
    value: FinancialCategory.ENTERTAINMENT,
    label: 'Entertainment',
    description: 'Movies, events, and hobbies.',
    icon: 'clapperboard'
  },
  {
    value: FinancialCategory.EDUCATION,
    label: 'Education',
    description: 'Courses, books, and tuition.',
    icon: 'graduation-cap'
  },
  { value: FinancialCategory.CLOTHING, label: 'Clothing', description: 'Apparel and accessories.', icon: 'shirt' },
  {
    value: FinancialCategory.MISCELLANEOUS,
    label: 'Miscellaneous',
    description: 'Anything that doesn\u2019t fit elsewhere.',
    icon: 'more-horizontal'
  }
];

export function categoryLabel(category: FinancialCategory): string {
  const all = [...INCOME_CATEGORY_OPTIONS, ...EXPENSE_CATEGORY_OPTIONS];
  return all.find((c) => c.value === category)?.label ?? category;
}
