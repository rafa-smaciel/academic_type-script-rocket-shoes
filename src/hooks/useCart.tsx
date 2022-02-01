import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';
//import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart]; //Novo array a partir do que tenho no carrinho. Dessa forma, mantenho a imutabilidade e consigo trabalhar com os recursos do JS. UpdatedCart é um novo array com os valores de cart. Qualquer alteração que se fazer nele, não vai se refletir no cart.

      const productExists = updatedCart.find(product => product.id === productId); //Verificar se o produto existe. Utiliza-se o find. Primeiramente eu passo o "product", depois vou verificar com arrow fuction se o ID desse product é igual ao argumento desse função, ou seja, productId. Se for igual, significa que o produto existe. Se não for o produto não existe no carrinho.

      const stock = await api.get(`/stock/${productId}`);//Variavel para fazer as verificações de estoque. Primeiramente tenho que chamar a rota do estoque. O estoque retorna um array com objetos. Onde eu tenho uma propriedade ID e uma propriedade amount. Eu quero o amount de determinado produto. De cero ID. O JSON server é bem esperto. Se eu passar /estoque/"valor do ID", ele ja vai retornar apenas o item que o ID dele for igual ao que eu passar no parametro da rota. Esse valor será passado dentro do parenteses do get.

      const stockAmount = stock.data.amount;//Só para deixar bem legivel.

      const currentAmount = productExists ? productExists.amount : 0; //"vai ser o produto. Se o produto existe no carrinho, eu pego o amount dele. Se não existe no carrinho é igual a zero. "

      const amount = currentAmount + 1; //quantidade desejada. Seria a quantidade atual + 1.

      if (amount > stockAmount) { //quantidade desejada, que é o amount, for maior que a quantidade que eu tenho no estoque, a função tem que falhar.
        toast.error('Quantidade solicitada fora de estoque'); //Continuando a observação acima, ele tem que falhar com a mensagem ao lado. Fornecida pelo exercicio.
        return; //Se ele falhar, vou querer que ele continue a fazer as coisas que estão aqui em baixo? Se não, insero o "return"
      }

      if (productExists) {
        productExists.amount = amount; //Se o produto existe, eu vou atualizar a quantidade do produto.
      } else { //Se ele não existe, ele adiciona o item no carrinho.
        const product = await api.get(`/products/${productId}`);//Se for um produto novo, vou buscar ele na minha API com o get. Passando o caminho. Só que tem um grande porém. O product ele vai retornar o array com os objetos presentes na API. São eles: Id, tile, price e image. 

        const newProduct = { // Continuando o raciocinio.... Mais sera que o nosso carrinho espera isso? Ele espera além desses dados todos (consultados no interface types.ts, dentro de SRC),  campo amount. Portanto temos que pegar todos os campos retornados da APi e criar um campo amount com valor 1, ja que é a primeira vez que ele esta sendo adicionado ao carrinho.
          ...product.data,
          amount: 1
        } 
        updatedCart.push(newProduct) // Tenho que perpetuar tudo isso com o updateCart com o Push nele com o newProduct. Lembrando que eu pude dar um push no updateCart, pois ele não esta apontando para a mesma referencia (...cart), ou seja, não estamos quebrando a regra da imutabilidade do react aqui! 
      }

        setCart(updatedCart); // Para finalizar, tenho que dar um setCart com o updatedCart, para perpetuar essas alterações do updatedCart dentro do meu carrinho.

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart)) // E por fim, dar um localStorage.setItem. Eu tenho que passar o item do localStorage aqui. A chave tem que ser essa passado no exercicio para essa aplicação!. Se você perceber, o value do setItem deverá ser uma string. O valor naturalmente deveria ser o "updateCart", porém o mesmo é um array de produto. Logo não aceito. Assim, iremos transformar em string, com o JSON.stringify, passando o "updateCart" no parenteses.  

    } catch { // Uma cláusula catch contém declarações que especificam o que fazer caso uma exceção seja lançada no bloco try
      toast.error('Erro na adição do produto'); //Mensagem fornecida pelo exercicio para aparecer caso der erro na adição do produto.
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // O que tenho que fazer para remover o produto? Tenho que verificar se ele existe no meu carrinho. Para verificar se ele existe no meu carrinho, vamos utilizar uma estratégia com updatedCart, findIndex e Splice.
      const updatedCart = [...cart];// Conceito da imutabilidade, ou seja, referencio pelo cart para alterar o updatedCart através do Slice, porém com o ... eu não altero o cart.
      const productIndex = updatedCart.findIndex(product => product.id === productId); // Utilizando o findIndex porque com o Index poderei usar o splace, para poder remover do array. Logo se ele não encontrou, ele deverá ser maior ou igual a zero.

      if (productIndex >= 0) {// Se ele encontrou, vou fazer o productIndex maior ou igual a zero. O findIndex, segundo sua especificação, se ele não encontra, ele retorna -1. //Obs.: Dentro do If é "se ele encontrou"; o Else dará a reação caso ele não encontre.
        updatedCart.splice(productIndex, 1); // Se ele encontrou, eu vou pegar do meu array. Depois vamos usar o Splice, que tem o poder de remover os elementos do array e se for necessário adcionar novos elementos ao array. Como parametros, dentro dos parenteses, eu passo o inicio (@param start) aonde eu quero começar a deletar e a quantidade (@param deleteCount) de itens que eu quero deletar. Nesse caso quero apenas deletar. Sendo assim, eu vou iniciar no productIndex; querendo deletar apenas 1 produto.
        setCart(updatedCart);
        // Para perpetuar as informações do carrinho atualizado no localStorage. Conforme abaixo.
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart)) 
      } else { 
      // Se ele não encontrar o item no carrinho? Como eu ja tenho uma mensagem de erro no Catch, no else posso forçar ele a dar erro, através do throw Error. Quando da o throw error, ele para de rodar no try e cai diretamente no catch, dando a mensagem abaixo.
        throw Error(); 
      }
    } catch {
      toast.error('Erro na remoção do produto'); // Conforme parametros do exercicio.
    }
  };

  const updateProductAmount = async ({
    productId,
    amount, // Por padrão do programador, é ideal de receber esse "amount" considerando  que o valor ja é o valor desejado que eu quero do produto.
  }: UpdateProductAmount) => { // Vamos perpetuar o valor no carrinho, sair instantaneamente da função se o quantidade do produto for maior ou igual a zero (então não posso deixar zerar um produto no carrinho, seria igual a ter um produto com quantidade negativa), mostrar um erro com a mensagem definida quando a quantidade do produto estourar em relação ao quantidade do estoque e no catch, mostrar a mensagem definido no exercicio pra dizer que ocorreu um erro na alteração da quantidade do produto; um erro geral, por assim dizer.        // Utilizamos o "updateproductAmount", porque se virmos a pagina Cart, index.tsx, na que eu chamar na "handleProductIncrement" e "handleProductDecrement", eu ja passo ele com git add

    try {
      if (amount <= 0) { // Sendo assim, ja vou verificar se a quantidade desejada do produto for menor ou igual a zero, eu tenho que sair; sem alterar nada.
        return;
      }

      const stock = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount;

      if (amount > stockAmount) {// Prosseguindo, eu vou verificar se a quantidade desejada é maior da que eu tenho no estoque.
      toast.error('Quantidade solicitada fora de estoque'); // Se for maior, eu mostro essa mensagem.
      return; // Tenho que mostrar a mensagem acima e depois cancelar a execução dessa função; sair dela, dando o return.
    }
      const updatedCart = [...cart]; // Vou pegar o updatedCart, pegando ...cart dessa forma, sem correr o risco de quebrar a imutabilidade.
      const productExists = updatedCart.find(product => product.id === productId); 

      if (productExists) { // Agora eu ja posso verificar se o produto existe.
        productExists.amount = amount; // Se o produto existe, productExists.amount recebe amount.
        setCart(updatedCart); // Depois tenho que perpetuar o updateCart no carrinho.
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart)) // E dar o setItem com o valor atualizado.
      } else { // Agora se ele não encontrar esse produto no carrinho, ai agente tem um problema. Como eu quero incrementar um produto no carrinho, sendo que ele nem existe? Porque aquele "addproduct" eu estou cliclando em um produto la na pagina home, que ele pode estar com zero, então faz sentido ele não existir; e se ele não existir eu adiciono esse produto. Porém, essa função aqui é somente para o update, então nao faz sentido ele não existir no carrinho, ele tem que existir. Então se ele não existe, agente da um throw "error", pra ele mostrar a menssagem geral do catch "Erro na alteração de quantidade do produto".
        throw Error();
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
