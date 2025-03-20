import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import axios from "../../config/axiosConfig";
import { toast } from 'react-toastify';

const urlEvents = "events/"

export default function UpdateEvent() {
    const navigate = useNavigate();
    const { eid } = useParams();
    const [event, setEvent] = useState([]);

    const {
        register,
        handleSubmit,
        setValue,
    } = useForm({
        mode: "onBlur",
    });

    useEffect(() => {
        function axiosData() {
            axios.get(urlEvents + eid)
                .then(response => {
                    setEvent(response.data);
                    setValue("id_event", response.data.id_event);
                    setValue("publication_date", response.data.publication_date.slice(0, -14));
                    setValue("event_date", response.data.event_date.slice(0, -14));
                    setValue("event_name", response.data.event_name);
                    setValue("event_description", response.data.event_description);
                    setValue("inscription_price", response.data.inscription_price);
                })
                .catch(error => {
                    toast.error(error);
                })
        }
        axiosData();
    }, []);

    const updateEvent = (e) => {
        axios.put(urlEvents + e.id_event, {
            event_date: e.event_date,
            event_name: e.event_name,
            event_description: e.event_description,
            inscription_price: e.inscription_price,
        })
            .then(response => {
                toast.success('Se actualizó el evento correctamente.');
                navigate(`/administrationevents`);
            })
            .catch(error => {
                if (error.response.statusText && error.response.statusText === "Unauthorized") return toast.error(error.response.data.error);
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                console.log(error)
            })
    }

    return (
        <>
            <div className="sistema-container">
                <h1>Actualizar evento:</h1>

                <div key={event.id_event}>
                    <form onSubmit={handleSubmit(updateEvent)} className="checkout-form">
                        <p>ID:</p>
                        <input type="text" name="id_event" disabled {...register("id_event")} />
                        <input type="date" name="event_date"  {...register("event_date", { required: true })} />
                        <input type="text" name="event_name" {...register("event_name", { required: true })} />
                        <input type="text" name="event_description" {...register("event_description", { required: true })} />
                        <input type="number" name="inscription_price" min={"0"} {...register("inscription_price")} />

                        <div className="sistema-bajas-modif-botones">
                            <button type="submit" className="delete-event-button">Modificar</button>
                        </div>

                    </form>
                </div>
                <NavLink to={`/administrationevents`} className="info-button">Volver</NavLink>
            </div>
        </>
    )
}