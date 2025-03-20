import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../config/axiosConfig";
import { toast } from 'react-toastify';
import { useForm } from "react-hook-form";

const date = new Date();

const urlGetExpenditures = "utils/expenditures/"

export default function Expenditures() {

    const today = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
    const [expenditures, setexpenditures] = useState([])

    const {
        register,
        handleSubmit
    } = useForm({
        mode: "onBlur",
    });

    
    function getExpenditures(e) {
        axios.get(urlGetExpenditures + e.month)
            .then(response => {
                setexpenditures(response.data);
            })
            .catch(error => {
                console.log(error);
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
            })
    }

    return (
        <div className="cuenta-main">

            <h2>Consulta egresos mensuales:</h2>
            <form onSubmit={handleSubmit(getExpenditures)} className="checkout-form">
                <input type="month" defaultValue={today} name="month" {...register("month", { required: true })} />
                <button type="submit" className="cuenta-button" >Consultar</button>
            </form>
            {
                expenditures.length != 0 &&
                <table>
                    <thead>
                        <tr>
                            <th>Fecha del egreso</th>
                            <th>Motivo</th>
                            <th>Monto</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            expenditures.map((exp) => (
                                <tr key={exp.id_exp}>
                                    <th>{new Date(exp.pay_date).toLocaleDateString('en-GB')}</th>
                                    <th>{exp.descr}</th>
                                    <th>{exp.amount}</th>
                                </tr>
                            ))
                        }

                    </tbody>
                </table>
            }

            
            <Link to={"/administrationpayments"} className="info-button">Volver</Link>
        </div>
    )
}