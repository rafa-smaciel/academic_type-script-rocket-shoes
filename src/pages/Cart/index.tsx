import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({ //O que temos que fazer? Percebe que ja pegamos o "cart.map", e no cart.map ja teremos os produtos. Os produtos tem o id, title, price, image e amount; mas nós não temos o cartFormatted e também não temos o subtotal. Então vamos desestruturar o product, vamos utilizar os campos que ele ja tem, vamos adicionar o priceFormatted, onde esse campo será o formatPrice, do product.price, e o subTotal com o formatPrice, passando o product.price * a quantidade, ou seja, product.amount. 
    ...product,
    priceFormatted: formatPrice(product.price),
    subtotal: formatPrice(product.price * product.amount)
  }))
  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        // Agora o Total, vamos utilizar o Reduce para facilitar. Dando um reduce no carrinho, antes vou dar um return. Agente só precisa de uma linha. Vai ser meu acumulador, o sumTotal, ou seja, o total da soma até agora, + o product.price (preço do produto) * o product.amount (quantidade do produto); Portanto, eu estou pegando o acumulador e somando os sub-totais; que vai dar o preço total no fim das contas. Ja esta udo certo, como string, com o valor formatado.
        return sumTotal + product.price * product.amount
      }, 0)
    )

  function handleProductIncrement(product: Product) {
    // Agora vamos para as funções. Nessa função do Increment, tenho que chamar o updateProductAmount. Eu tenho que passar o product.id e o amount para ele. Passando entre os parenteses e chaves o productId. Ele recebe o product, então eu passo ele, coloco o "ponto" e depois o "id", virgula, depois o amount eu passo o product, coloco o "ponto" e depois o "amount". Porém surge uma pergunta. É só o product.amount? Não! Lembra que la dentro eu ja estou esperando o amount desejado. Então se estou incrementado, eu quero +1.
    updateProductAmount({ productId: product.id, amount: product.amount + 1});
  }

  function handleProductDecrement(product: Product) {
    // Agora vou copiar como base a função passada acima, mais eu vou colocar -1. 
    updateProductAmount({ productId: product.id, amount: product.amount - 1});
  }

  function handleRemoveProduct(productId: number) {
    // Por fim, para remover o produto, é só chamar o removeProduct e passar o productId que eu recebo aqui no argumento da função.
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(product => (
             <tr key={product.id} data-testid="product"> 
             <td>
               <img src={product.image} alt={product.title} />
             </td>
             <td>
               <strong>{product.title}</strong>
               <span>{product.priceFormatted}</span>
             </td>
             <td>
               <div>
                 <button
                   type="button"
                   data-testid="decrement-product" 
                 disabled={product.amount <= 1}
                 onClick={() => handleProductDecrement(product)}
                 >
                   <MdRemoveCircleOutline size={20} />
                 </button>
                 <input
                   type="text"
                   data-testid="product-amount"
                   readOnly
                   value={product.amount}
                 />
                 <button
                   type="button"
                   data-testid="increment-product"
                 onClick={() => handleProductIncrement(product)}
                 >
                   <MdAddCircleOutline size={20} />
                 </button>
               </div>
             </td>
             <td>
               <strong>{product.subtotal}</strong>
             </td>
             <td>
               <button
                 type="button"
                 data-testid="remove-product"
               onClick={() => handleRemoveProduct(product.id)}
               >
                 <MdDelete size={20} />
               </button>
             </td>
           </tr>
          ))}
         
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;

/* Sobre o return: 

Agora iremos fazer um Map do cartFormated e alterar esses valores ("https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis1.jpg") para valores dinâmicos. Então o que tenho que repetir? Eu tenho que repetir o conteudo do tbody. Logo após isso, pego entre chaves o cartFormatted, recebe um map, com o "ponto" map, recebe o product. Lembrando que o primeiro elemento da repetição, tem que ter um key, então vou colocar um product.id. O img src, estou esperando um product.image, e no alt um product.title (vai se repetir o mesmo ao que fizemos na pagina home); no strong, copia o product.title novamente, no span com o valor fixo, retira-se esse valor e colocar product.priceFormatted; no handleProductDecrement, temos que passar o product; no handleProductIncrement, mesma coisa, passa-se o product. No input, o value estava como 2, porém agora vamos passar o product.amount (quantidade). No strong do subtotal, vamos passar o product.subTotal. No strong do Total, apagasse o valor fixo e coloca-se a variavel criada para o total.*/