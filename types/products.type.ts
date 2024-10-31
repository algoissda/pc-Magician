interface Product {
  id: number;

  product_name: string;

  price: number | null;

  explanation: string | null;

  image_url: string | null;

  purpose: string | null;

  type: string;
}

export default Product;
