import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => { // Segundo a documentação, esse item mostra os valores na frente dos botoes. 
    const newSumAmount = {...sumAmount}; // Criei um novo abjeto a partir do sumAmount. De forma independente. Não estão apontando para a mesmo referencia.
    newSumAmount[product.id] = product.amount; // Essa forma de passar com o [], significa que estou pegando um objeto. Estou acessando  product.id (poderia ser qualquer outro nome), porem por ser dinamica, eu passo através de uma variavel. 
    return newSumAmount;
  }, {} as CartItemsAmount) 

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get<Product[]>('products');// O Axios tem uma funcionalidade de passar a tipagem pelo 'generic', onde quando eu passo "<Product[]>", ele me retorna um array de produtos.

      const data = response.data.map(product => ({ // Se você perceber os produtos são do tipo "productformatted", então eles vão ter aquele formato do carrinho, o que retorna da API, porém, eu também quero que ele tenha o priceFormatted, que é o campo que estara com o valor formatado, com R$ na frente e virgula.
        ...product, //passando o product
        priceFormatted: formatPrice(product.price) // Dentro do product, vem o priceFormatted, que é o preço formatado. A importação ja consta no arquivo, agora basta chama-lo na priceFormatted.
      })) 
      setProducts(data); // Agora que eu ja fiz a formatação no dados do retorno da API, eu dou um setProducts(data).
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) { // Usar oo hook addProduct passando o id, e só. Toda a funcionalidade de adicionar o item ao carrinho esta dentro do hook.
    addProduct(id);
  }

  //Primeira etapa é deixar os dados dinamicos. Inicialmente estava estáticos.
  return (
    <ProductList>
      {products.map(product => (
          <li key={product.id}> 
          <img src={product.image} alt={product.title}/>
          <strong>{product.title}</strong>
          <span>{product.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
          onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
