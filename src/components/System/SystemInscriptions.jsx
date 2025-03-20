import { useState } from 'react'
import { useEffect } from "react";
import axios from "../../config/axiosConfig";
import { NavLink } from "react-router-dom";
import { toast } from 'react-toastify';
import { downloadExcel } from "react-export-table-to-excel";

const date = new Date();

const urlInscriptions = "inscriptions/"
const urlUpdateNewInscriptionsNewRequests = "inscriptions/updatenewrequests"
const urlPartialPayInscription = "inscriptions/addinscpayment/"

export default function SystemInscriptions() {
    const [inscriptionsReq, setinscriptionsReq] = useState([]);
    const [amounts, setAmounts] = useState({});

    function fetchInscriptions() {
        axios.get(urlInscriptions)
            .then(response => {
                setinscriptionsReq(response.data);
            })
            .catch(error => {
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                console.log(error);
            });
    }

    useEffect(() => {
        fetchInscriptions();
    }, []);

    useEffect(() => {
        function axiosData() {
            axios.get(urlUpdateNewInscriptionsNewRequests)
                .catch(error => {
                    console.log(error)
                })
        }
        axiosData();
    }, [])

    /* 
        function deleteInscription(iid) {
            axios.delete(urlInscriptions + iid, { withCredentials: true })
                .then(response => {
                    toast.success('Se eliminó la inscripción correctamente.');
                    fetchInscriptions();
                })
                .catch(error => {
                    toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                    console.log(error)
                })
        }
     */
    function payPartialInscription(iid, inscriptionPrice) {
        const payDate = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate())
        const amount = amounts[iid] || inscriptionPrice;

        if (!amount) {
            toast.error("Por favor, ingresa un monto.");
            return;
        }

        axios.post(urlPartialPayInscription, { iid: iid, payDate: payDate, amount: amount })
            .then(response => {
                toast.success('Se registró el pago.');
                fetchInscriptions();
                setAmounts(prev => ({ ...prev, [iid]: "" }));
            })
            .catch(error => {
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                console.log(error)
            })
    }

    function handleDownloadExcel() {
        const header = ["Nombre", "Apellido", "Teléfono", "Evento", "Fecha", "Precio", "Fecha Inscrp", "Fecha Pago", "ID Insc", "Entregó"];
        downloadExcel({
            fileName: "Inscripciones",
            sheet: "Inscripciones",
            tablePayload: {
                header,
                body: inscriptionsReq,
            },
        });
    }

    return (
        <div className="system_incs_container">
            <h1>Gestión solicitudes de inscripción:</h1>
            {inscriptionsReq.length != 0 ?
                <div className="table_container">
                    <button className="boton-quitar-carrito" onClick={handleDownloadExcel}>Exportar</button>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Teléfono de contacto</th>
                                <th>Nombre evento</th>
                                <th>Fecha evento</th>
                                <th>Precio inscripción</th>
                                <th>Fecha inscripción</th>
                                <th>Pagado</th>
                                <th>Entregó</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                inscriptionsReq.map((inscription) => (
                                    <tr key={inscription.id_inscription}>
                                        <th>{inscription.first_name}</th>
                                        <th>{inscription.last_name}</th>
                                        <th>{inscription.tel_contact}</th>
                                        <th>{inscription.event_name}</th>
                                        <th>{new Date(inscription.event_date).toLocaleDateString('en-GB')}</th>
                                        <th>${inscription.inscription_price}</th>
                                        <th>{new Date(inscription.inscription_date).toLocaleDateString('en-GB')}</th>
                                        <th>{inscription.pay_date ? "PAGÓ" : "PENDIENTE"}</th>
                                        <th>{inscription.pay_date ? "---" : inscription.total_amount}</th>
                                        {!inscription.pay_date ? (
                                            <th className="edit-event-buttons-container">
                                                <div className="merch-input-container">
                                                    <input
                                                        className="merch-input"
                                                        type="text"
                                                        name="amount"
                                                        placeholder="Monto *"
                                                        inputMode="numeric"
                                                        pattern="\d*"
                                                        title="Solo números."
                                                        value={amounts[inscription.id_inscription] || inscription.inscription_price}
                                                        onChange={(e) =>
                                                            setAmounts(prev => ({
                                                                ...prev,
                                                                [inscription.id_inscription]: e.target.value
                                                            }))
                                                        }
                                                    />
                                                    <button type="button" className="merch-button" onClick={() => payPartialInscription(inscription.id_inscription, inscription.inscription_price)} > Registrar </button>
                                                </div>
                                                {/* <button className="delete-event-button" onClick={() => { deleteInscription(inscription.id_inscription) }}>Borrar</button> */}
                                            </th>
                                        ) : <th></th>}
                                    </tr>
                                ))
                            }

                        </tbody>
                    </table> </div> : <p>No se encontraron inscripciones a eventos.</p>}
            <NavLink to={"/"} className="info-button" >Volver</NavLink>
        </div>
    )
}
