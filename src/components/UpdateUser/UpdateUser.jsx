import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useUser } from "../context/dataContext";
import axios from "../../config/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Swal from "sweetalert2";

const urlUser = "users/"
const urlUpdateUser = "users/updateuser"
const urlPassChanger = "users/changeorforgot"

export default function UpdateUser() {
    const navigate = useNavigate();
    const { user, setUser } = useUser();

    const {
        register,
        handleSubmit,
        setValue,
    } = useForm({
        mode: "onBlur",
    });

    const {
        register: register2,
        handleSubmit: handleSubmit2,
    } = useForm({
        mode: "onBlur",
    });

    useEffect(() => {
        function axiosData() {
            axios.get(urlUser)
                .then(response => {
                    setUser(response.data);
                    const preFix = response.data.tel_contact.slice(2, -9)
                    const telContact = response.data.tel_contact.slice(-7)
                    setValue("first_name", response.data.first_name);
                    setValue("last_name", response.data.last_name);
                    setValue("email", response.data.email);
                    setValue("birth_date", response.data.birth_date.slice(0, -14));
                    setValue("dni", response.data.dni);
                    setValue("tel_pre", preFix);
                    setValue("tel_contact", telContact);
                })
                .catch(error => {
                    console.log(error);
                    toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                })
        }
        axiosData();

    }, [])

    const updateUser = (e) => {
        const telContact = `54${e.tel_pre}15${e.tel_contact}`
        axios.put(urlUpdateUser, {
            first_name: e.first_name,
            last_name: e.last_name,
            email: e.email,
            birth_date: e.birth_date,
            dni: e.dni,
            tel_contact: telContact
        })
            .then(response => {
                Swal.fire({
                    icon: "success",
                    title: response.data,
                    showConfirmButton: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate(`/`);
                    }
                });
            })
            .catch(error => {
                toast.error(error.response.data.message);
            })
    }

    const updateUserPassword = (e) => {
        if (e.password !== e.repassword) return toast.error('Los passwords no coinciden. Intenta de nuevo');
        axios.post(urlPassChanger, { uid: user.id_user, password: e.password })
            .then(response => {
                Swal.fire({
                    icon: "success",
                    title: response.data,
                    showConfirmButton: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate(`/`);
                    }
                });
            })
            .catch(error => {
                if (error.status === 400) return toast.error(error.response.data.message);
                toast.error(error.response.data.message);
            })
    }

    return (
        <div className="update_user_container">
            <form onSubmit={handleSubmit(updateUser)} className="checkout-form">
                <input type="number" name="dni" {...register("dni", { required: true })} />
                <input type="text" name="first_name" maxLength="30" pattern="^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{3,30}$" title="No uses símbolos ni números. Min 3, Max 30 carácteres." {...register("first_name", { required: true })} />
                <input type="text" name="last_name" maxLength="30" pattern="^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{3,30}$" title="No uses símbolos ni números. Min 3, Max 30 carácteres." {...register("last_name", { required: true })} />
                <input type="email" name="email" placeholder="Email " {...register("email")} />
                <input type="date" name="birth_date" {...register("birth_date", { required: true })} />
                <p className="info-text-register">Teléfono ejemplo: 123 1234567</p>
                <div className="telephone-container">
                    <div className="tel-pre">
                        <p className="info-text-register">0-</p>
                        <input type="text" className="tel-prefix" id="tel_pre" name="tel_pre" placeholder="Prefijo *" inputMode="numeric" pattern="\d*" maxLength="5" minLength="3" title="Solo números. min 3 max 5 dígitos." {...register("tel_pre", { required: true })} />
                    </div>
                    <div className="telephone">
                        <p className="info-text-register">15-</p>
                        <input type="text" id="tel_contact" name="tel_contact" placeholder="Teléfono *" inputMode="numeric" pattern="\d*" maxLength="7" minLength="7" title="Solo números. 7 dígitos." {...register("tel_contact", { required: true })} />
                    </div>
                </div>

                <div className="sistema-bajas-modif-botones">
                    <button type="submit" className="boton-quitar-carrito">Actualizar datos</button>
                </div>

            </form>

            <form onSubmit={handleSubmit2(updateUserPassword)} className="checkout-form">
                <input type="password" name="password" placeholder="Ingresa un nuevo password"  maxLength="8" pattern="[A-Za-z0-9]{8,8}" {...register2("password", { required: true })} />
                <input type="password" name="repassword" placeholder="Repite el nuevo password"  maxLength="8" pattern="[A-Za-z0-9]{8,8}" {...register2("repassword", { required: true })} />

                <div className="sistema-bajas-modif-botones">
                    <button type="submit" className="boton-quitar-carrito">Actualizar password</button>
                </div>

            </form>
            <Link to={"/"} className="info-button">Volver</Link>
        </div>
    )
}
