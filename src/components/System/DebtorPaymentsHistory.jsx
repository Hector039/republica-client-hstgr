import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import axios from "../../config/axiosConfig";
import { toast } from 'react-toastify';

const urlMonthlyHistory = "monthlypayments/"
const urlUserAnnualHistory = "annualpayments/"
const urlUserInscriptionHistory = "inscriptions/"
const urlUserMerchHistory = "merchrequests/"

export default function DebtorPaymentsHistory() {
    const { uid } = useParams()
    const [monthlyPaymentsHistory, setMonthlyPaymentsHistory] = useState([])
    const [annualPaymentsHistory, setAnnualPaymentsHistory] = useState([])
    const [merchHistory, setMerchHistory] = useState([])
    const [inscriptionHistory, setInscriptionHistory] = useState([])
    const meses = [" ", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];

    useEffect(() => {
        function axiosData() {
            axios.get(urlMonthlyHistory + uid)
                            .then(response => {
                                setMonthlyPaymentsHistory(response.data);
                            })
                            .catch(error => {
                                console.log(error);
                                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                            })
                        axios.get(urlUserAnnualHistory + uid)
                            .then(response => {
                                setAnnualPaymentsHistory(response.data);
                            })
                            .catch(error => {
                                console.log(error);
                                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                            })
                        axios.get(urlUserInscriptionHistory + uid)
                            .then(response => {
                                setInscriptionHistory(response.data);
                            })
                            .catch(error => {
                                console.log(error);
                                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                            })
                        axios.get(urlUserMerchHistory + uid)
                            .then(response => {
                                setMerchHistory(response.data);
                            })
                            .catch(error => {
                                console.log(error);
                                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                            })
        }
        axiosData();
    }, []);

    return (
        <div className="cuenta-main">
            <h1>Historial de pagos:</h1>

            <section className="cuenta-info">
                <h2>Cuotas:</h2>
                {!monthlyPaymentsHistory.length ? <p className="info-text-register">Sin datos</p> :

                    <table>
                        <thead>
                            <tr>
                                <th>Fecha del registro</th>
                                <th>Mes</th>
                                <th>Año</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                monthlyPaymentsHistory.map((payment) => (
                                    <tr key={payment.id_payment}>
                                        <th>{new Date(payment.pay_date).toLocaleDateString('en-GB')}</th>
                                        <th>{meses[payment.month_paid]}</th>
                                        <th>{payment.year_paid}</th>
                                    </tr>
                                ))
                            }

                        </tbody>

                    </table>}
                <h2>Matrícula anual:</h2>
                {!annualPaymentsHistory.length ? <p className="info-text-register">Sin datos</p> :

                    <table>
                        <thead>
                            <tr>
                                <th>Fecha del registro</th>
                                <th>Año</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                annualPaymentsHistory.map((payment) => (
                                    <tr key={payment.id_payment}>
                                        <th>{new Date(payment.pay_date).toLocaleDateString('en-GB')}</th>
                                        <th>{payment.year_paid}</th>
                                    </tr>
                                ))
                            }

                        </tbody>

                    </table>}
                <h2>Inscripciones a torneos:</h2>
                {!inscriptionHistory.length ? <p className="info-text-register">Sin datos</p> :
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha evento</th>
                                <th>Nombre evento</th>
                                <th>Fecha del pago</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                inscriptionHistory.map((insc) => (
                                    <tr key={insc.id_inscription}>
                                        <th>{new Date(insc.event_date).toLocaleDateString('en-GB')}</th>
                                        <th>{insc.event_name}</th>
                                        <th>{new Date(insc.pay_date).toLocaleDateString('en-GB')}</th>
                                    </tr>
                                ))
                            }

                        </tbody>

                    </table>}
                <h2>Solicitudes de indumentaria:</h2>
                {!merchHistory.length ? <p className="info-text-register">Sin datos</p> :
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha solicitud</th>
                                <th>Descripción</th>
                                <th>Fecha del pago</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                merchHistory.map((merch) => (
                                    <tr key={merch.id_request}>
                                        <th>{new Date(merch.req_date).toLocaleDateString('en-GB')}</th>
                                        <th>{merch.req_description}</th>
                                        <th>{new Date(merch.pay_date).toLocaleDateString('en-GB')}</th>
                                    </tr>
                                ))
                            }

                        </tbody>

                    </table>}
            </section>
            <NavLink to={`/administrationdebtors`} className="info-button">Volver</NavLink>
        </div>
    )
}