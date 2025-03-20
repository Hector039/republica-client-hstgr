import { useState } from 'react'
import { useEffect } from "react";
import axios from "../../config/axiosConfig";
import { NavLink } from "react-router-dom";
import { toast } from 'react-toastify';
import { downloadExcel } from "react-export-table-to-excel";

const date = new Date();

const urlMerchRequests = "merchrequests/"
const urlMarkPaidMerchRequests = "merchrequests/updatepaymentstatus/"
const urlPartialPayMerchRequest = "merchrequests/addmerchpayment/"
const urlUpdateNewMerchRequests = "merchrequests/updatenewrequests"
const urlGetFeaturesPositions = "utils/openclosefeatures"
const urlUpdateFeaturesPositions = "utils/openclosefeatures/"

export default function SystemMerch() {
    const [merchRequests, setMerchReq] = useState([])
    const [amounts, setAmounts] = useState({});
    const [featurePosition, setFeaturePosition] = useState(0);

    function openCloseFeatures(fid, position) {
        const pos = position ? 0 : 1;
        axios.put(urlUpdateFeaturesPositions + fid + "/" + pos)
            .then(response => {
                setFeaturePosition(pos);
            })
            .catch(error => {
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                console.log(error)
            })
    }

    function fetchMerch() {
        axios.get(urlMerchRequests)
            .then(response => {
                setMerchReq(response.data);
            })
            .catch(error => {
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                console.log(error)
            })
    }

    function fetchPositions() {
        axios.get(urlGetFeaturesPositions)
            .then(response => {
                setFeaturePosition(response.data[0].feature);
            })
            .catch(error => {
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                console.log(error)
            })
    }

    useEffect(() => {
        fetchMerch();
        fetchPositions();
    }, []);


    useEffect(() => {
        function axiosData() {
            axios.get(urlUpdateNewMerchRequests)
                .catch(error => {
                    toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                    console.log(error)
                })
        }
        axiosData();
    }, [])

/* 
    function deleteMerchRequest(mid) {
        axios.delete(urlMerchRequests + mid, { withCredentials: true })
            .then(response => {
                toast.success('Se eliminó la solicitud correctamente.');
                fetchMerch();
            })
            .catch(error => {
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                console.log(error)
            })
    }
 */
    function payPartialMerchRequest(mid) {
        const payDate = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate())
        const amount = amounts[mid] || "";

        if (!amount) {
            toast.error("Por favor, ingresa un monto.");
            return;
        }

        axios.post(urlPartialPayMerchRequest, { mid: mid, payDate: payDate, amount: amount })
            .then(response => {
                toast.success('Se registró el pago parcial.');
                fetchMerch();
                setAmounts(prev => ({ ...prev, [mid]: "" }));
            })
            .catch(error => {
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                console.log(error)
            })
    }

    function markPaidMerchRequest(mid) {
        const payDate = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate())
        axios.put(urlMarkPaidMerchRequests, { mid: mid, payDate: payDate })
            .then(response => {
                toast.success('Se saldó la solicitud.');
                fetchMerch();
            })
            .catch(error => {
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                console.log(error)
            })
    }

    function handleDownloadExcel() {
        const header = ["ID usuario", "Nombre", "Apellido", "Teléfono", "ID Solic", "Fecha Solicitud", "Descripcion", "Fecha pago", "Entregó"];
        downloadExcel({
            fileName: "Solicitudes",
            sheet: "Solicitudes",
            tablePayload: {
                header,
                body: merchRequests,
            },
        });
    }

    return (
        <div className="system_incs_container">
            {featurePosition ? <button className="is_open" onClick={() => { openCloseFeatures(1, featurePosition) }}>Solicitudes habilitadas</button> :
                <button className="is_closed" onClick={() => { openCloseFeatures(1, featurePosition) }}>Solicitudes deshabilitadas</button>}

            <h1>Historial de solicitudes de encargues:</h1>
            {merchRequests.length != 0 ?
                <div className="table_container">
                    <button className="boton-quitar-carrito" onClick={handleDownloadExcel}>Exportar</button>

                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Teléfono</th>
                                <th>Fecha Solicitud</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Entregó</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                merchRequests.map((merchReq) => (
                                    <tr key={merchReq.id_request}>
                                        <th>{merchReq.first_name}</th>
                                        <th>{merchReq.last_name}</th>
                                        <th>{merchReq.tel_contact}</th>
                                        <th>{new Date(merchReq.req_date).toLocaleDateString('en-GB')}</th>
                                        <th>{merchReq.req_description}</th>
                                        <th>{merchReq.pay_date ? "PAGÓ" : "PENDIENTE"}</th>
                                        <th>{merchReq.pay_date ? "---" : merchReq.amount}</th>
                                        {!merchReq.pay_date ? (
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
                                                        value={amounts[merchReq.id_request] || ""}
                                                        onChange={(e) =>
                                                            setAmounts(prev => ({
                                                                ...prev,
                                                                [merchReq.id_request]: e.target.value
                                                            }))
                                                        }
                                                    />
                                                    <button type="button" className="merch-button" onClick={() => payPartialMerchRequest(merchReq.id_request)} > Registrar parcial </button>
                                                </div>
                                                <button type="button" className="merch-button" onClick={() => markPaidMerchRequest(merchReq.id_request)} > Saldar </button>
                                                {/* <button className="delete-event-button" onClick={() => { deleteMerchRequest(merchReq.id_request) }}>Borrar</button> */}
                                            </th>) : <th></th>}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table></div> : <p>No se encontraron solicitudes.</p>}

            <NavLink to={"/"} className="info-button" >Volver</NavLink>
        </div>
    )
}
