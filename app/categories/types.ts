export interface Category {
    id: string;
    name: string;
    type: "Expense" | "Income";
}

export const SAMPLE_CATEGORIES = [
    { id: '1', name: "Food & Dining" },
    { id: '2', name: "Rent & Housing" },
    { id: '3', name: "Transportation" },
    { id: '4', name: "Entertainment" },
    { id: '5', name: "Shopping" },
    { id: '6', name: "Healthcare" },
    { id: '7', name: "Utilities" },
    { id: '8', name: "Education" },
    { id: '9', name: "Travel" },
    { id: '10', name: "Other" }
];