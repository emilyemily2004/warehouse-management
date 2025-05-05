export interface ProductArticle {
    art_id: string;
    amount_of: number;
  }

  export interface Product {
    name: string;
    contain_articles: ProductArticle[];
    price: number;
  }