// store.js
export const store = {
    allProducts: [],
    filters: {
        category: "All",
        tag: "All",
        attribute: "All"
    },
    // Add a listener mechanism
    onFilterChange: () => {} 
};

