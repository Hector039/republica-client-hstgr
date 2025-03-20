import axios from "../../config/axiosConfig";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from 'react-toastify';

const date = new Date();

const urlUsers = "users/"
const urlAddMonthPayment = "monthlypayments/"
const urlAddAnnualPayment = "annualpayments/"
const urlAddLinkedMonthPayment = "monthlypayments/linkedpayment/"

export default function SystemPayments() {

    const payDate = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    const today = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");

    const [users, setUsers] = useState([])
    const [userDates, setUserDates] = useState({});
    const [monthAmounts, setMonthAmounts] = useState({});
    const [annualAmounts, setAnnualAmounts] = useState({});

    const {
        register,
        handleSubmit,
    } = useForm({
        mode: "onBlur",
    });

    function getUsers(e) {
        axios.post(urlUsers, { search: e.search, value: e.value })
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.log(error);
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
            })
    }

    function addPayment(e, uid, buttonType, feeMonth, feeAnnual) {
        const dateArray = e.split("-")

        if (buttonType === "month") {
            const amount = monthAmounts[uid] || feeMonth;
            if (!amount) {
                toast.error("Por favor, ingresa un monto.");
                return;
            }
            axios.post(urlAddMonthPayment, { uid: uid, month: dateArray[1], year: dateArray[0], payDate: payDate, amount: amount })
                .then(response => {
                    if (response.data !== "") return toast.success(response.data);
                    toast.success('Se registró el pago.');
                    setMonthAmounts(prev => ({ ...prev, [uid]: "" }));
                })
                .catch(error => {
                    if (error.response.data.code === 5) return toast.error(error.response.data.message);
                    console.log(error);
                    toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                })
        } else if (buttonType === "linked") {
            axios.post(urlAddLinkedMonthPayment, { uid: uid, month: dateArray[1], year: dateArray[0], payDate: payDate, isLinked: 1 })
                .then(response => {
                    toast.success('Se registró el pago por vínculo.');
                    setMonthAmounts(prev => ({ ...prev, [uid]: "" }));
                })
                .catch(error => {
                    if (error.response.data.code === 5) return toast.error(error.response.data.message);
                    console.log(error);
                    toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                })
        } else if (buttonType === "year") {
            const amount = annualAmounts[uid] || feeAnnual;

            if (!amount) {
                toast.error("Por favor, ingresa un monto.");
                return;
            }
            
            axios.post(urlAddAnnualPayment, { uid: uid, year: dateArray[0], payDate: payDate, amount: amount })
                .then(response => {
                    if (response.data !== "") return toast.success(response.data);
                    toast.success('Se registró el pago.');
                    setAnnualAmounts(prev => ({ ...prev, [uid]: "" }));
                })
                .catch(error => {
                    if (error.response.data.code === 5) return toast.error(error.response.data.message);
                    console.log(error);
                    toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                })
        }

    }

    const handleSubmit2 = (e, uid, feeMonth, feeAnnual) => {
        e.preventDefault();
        const buttonType = e.nativeEvent.submitter.name;
        const selectedDate = userDates[uid] || today;
        addPayment(selectedDate, uid, buttonType, feeMonth, feeAnnual);
    };

    const handleChange2 = (event, uid) => {
        setUserDates(prevState => ({
            ...prevState,
            [uid]: event.target.value
        }));
    }

    return (
        <div className="carrito">
            <h1>Gestión de pagos:</h1>

            <form onSubmit={handleSubmit(getUsers)} className="checkout-form">
                <label>Buscar usuario por:
                    <select {...register("search")}>
                        <option value="last_name" defaultChecked>Apellido</option>
                        <option value="first_name">Nombre</option>
                        <option value="dni">DNI</option>
                        <option value="user_group">Grupo</option>
                        <option value="user_status">Estado (0 o 1)</option>
                        <option value="TODO">Todo</option>
                    </select>
                </label>
                <label>Comienza con:
                    <input type="text" name="value" placeholder="Ingresa tu búsqueda..." {...register("value")} />
                </label>
                <button type="submit" className="cuenta-button">Buscar</button>
            </form>

            {users.length > 0 &&
                <div className="table_container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>DNI</th>
                                <th>Registrado</th>
                                <th>Estado</th>
                                <th>Tarifa</th>
                                <th>Última impaga</th>
                                <th>Entregó</th>
                                <th>Fecha a registrar</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                users.map((user) => (
                                    <tr key={user.id_user}>
                                        <th>{user.first_name}</th>
                                        <th>{user.last_name}</th>
                                        <th>{user.dni}</th>
                                        <th>{new Date(user.register_date).toLocaleDateString('en-GB')}</th>
                                        <th>{user.user_status ? "ACTIVO" : "INACTIVO"}</th>
                                        <th>{user.fee_descr}</th>
                                        <th><div className="unpaid_container">
                                            <p>{user.last_unpaid_month ? user.last_unpaid_month : "---"}/{user.last_unpaid_month_year ? user.last_unpaid_month_year : "---"}</p>
                                            <p>{user.last_unpaid_year ? user.last_unpaid_year : "---"}</p>
                                        </div></th>
                                        <th><div className="unpaid_container">
                                            <p>{user.last_unpaid_month_amount ? "$"+user.last_unpaid_month_amount : "---"}</p>
                                            <p>{user.last_unpaid_amount ? "$"+user.last_unpaid_amount : "---"}</p>
                                        </div></th>
                                        <th><form onSubmit={e => handleSubmit2(e, user.id_user, user.fee_month, user.fee_annual)} >

                                            <input
                                                type="month"
                                                id="month_paid"
                                                name="month_paid"
                                                value={userDates[user.id_user] || today}
                                                onChange={(e) => handleChange2(e, user.id_user)}
                                                required
                                            />
                                            <div className="payment_buttons_container">
                                                <button className="payments-buttons" type="submit" name="month" >Registrar</button>
                                                <input
                                                    className="merch-input"
                                                    type="text"
                                                    name="amount"
                                                    placeholder="Monto *"
                                                    inputMode="numeric"
                                                    pattern="\d*"
                                                    title="Solo números."
                                                    value={monthAmounts[user.id_user] || user.fee_month}
                                                    onChange={(e) =>
                                                        setMonthAmounts(prev => ({
                                                            ...prev,
                                                            [user.id_user]: e.target.value
                                                        }))
                                                    }
                                                />
                                                <button className="payments-buttons" type="submit" name="linked" >Registrar por vínculo</button>
                                            </div>

                                            <div className="payment_buttons_container">
                                                <button className="payments-buttons" type="submit" name="year" >Registrar Matricula</button>
                                                <input
                                                    className="merch-input"
                                                    type="text"
                                                    name="amount"
                                                    placeholder="Monto *"
                                                    inputMode="numeric"
                                                    pattern="\d*"
                                                    title="Solo números."
                                                    value={annualAmounts[user.id_user] || user.fee_annual}
                                                    onChange={(e) =>
                                                        setAnnualAmounts(prev => ({
                                                            ...prev,
                                                            [user.id_user]: e.target.value
                                                        }))
                                                    }
                                                />
                                            </div>

                                        </form>
                                        </th>
                                    </tr>
                                ))
                            }

                        </tbody>
                    </table>
                </div>
            }

        </div>
    )
}