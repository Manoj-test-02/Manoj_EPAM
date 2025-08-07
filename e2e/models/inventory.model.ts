export class InventoryPageModel {
    static readonly inventory_page = '.inventory_container';
    static readonly product_item = '.inventory_item';
    static readonly add_to_cart_button = 'button[data-test^="add-to-cart"]';
    static readonly remove_button = 'button[data-test^="remove"]';
    static readonly cart_badge = '.shopping_cart_badge';
    static readonly cart_link = '.shopping_cart_link';
    static readonly checkout_button = '[data-test="checkout"]';
    static readonly product_price = '.inventory_item_price';
    static readonly sort_container = '[data-test="product_sort_container"]';
    static readonly product_name = '.inventory_item_name';
    static readonly checkout_items = '.cart_item';
}
