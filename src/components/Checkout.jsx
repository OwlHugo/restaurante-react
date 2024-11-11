import { useContext } from "react";
import CartContext from "../store/CartContext";
import Modal from "./UI/Modal";
import { currencyFormatter } from "../utils/formatting";
import Input from "./UI/Input";
import UserProgressContext from "../store/UserProgressContext";
import Button from "./UI/Button";
import useHttp from "../hooks/useHttp";
import Error from "./Error";
const requestConfig = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
}
export default function Checkout() {
    const cartCtx = useContext(CartContext);
    const userProgressCtx = useContext(UserProgressContext);
    const { data, isLoading: isSending, error, sendRequest, clearData } = useHttp('http://localhost:3000/orders', requestConfig,)

    const cartTotal = cartCtx.items.reduce(
        (totalPrice, item) => totalPrice + item.quantity * item.price, 0
    )

    function handleClose() {
        userProgressCtx.hideCheckout();
    }

    function handleFinish() {
        userProgressCtx.hideCheckout();
        cartCtx.clearCart();
        clearData();
    }
    function handleSubmit(event) {
        event.preventDefault();
        const fd = new FormData(event.target);
        const customerData = Object.fromEntries(fd.entries());
        sendRequest(
            JSON.stringify({
                order: {
                    items: cartCtx.items,
                    customer: customerData
                },
            })
        )
    }
    let actions = (
        <>
            <Button tyṕe="button" textOnly onClick={handleClose}>Fechar</Button>
            <Button >Enviar Pedido</Button>

        </>
    );
    if (isSending) {
        actions = <span>Sending order data...</span>
    }

    if (data && !error) {
        return <Modal open={userProgressCtx.progress === 'checkout'} onClose={handleFinish}>
            <h2>Sucesso!</h2>
            <p>Seu pedido foi feito com sucesso.</p>
            <p>Nós enviaremos mais informação sobre o pedido nos próximos 10 minutos.</p>
            <p className="modal-actions">
                <Button onClick={handleFinish}>Okay</Button>
            </p>
        </Modal>
    }
    return <Modal open={userProgressCtx.progress === 'checkout'} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
            <h2>Checkout</h2>
            <p>Preço Total: {currencyFormatter.format(cartTotal)}</p>
            <Input label="Nome Completo" type="text" id="full-name" />
            <Input label="Endereço de Email" type="email" id="email" />
            <div className="control-row">
                <Input label="Endereço" type="text" id="Endereço" />
                <Input label="Bairro" type="text" id="Bairro" />
            </div>
            <div className="control-row">
                <Input label="CEP" type="text" id="CEP" />
                <Input label="Cidade" type="text" id="Cidade" />
            </div>
            {
                error && <Error title="Failed to submit order" message={error} />
            }

            <p className="modal-actions">
                {actions}
            </p>
        </form>
    </Modal>
}