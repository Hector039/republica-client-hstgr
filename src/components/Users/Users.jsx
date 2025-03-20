import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useUser } from "../context/dataContext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "../../config/axiosConfig";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content'
import { toast } from 'react-toastify';

const MySwal = withReactContent(Swal)

const date = new Date();

const urlUserLogin = "users/login"
const urlUser = "users/"
const urlUserRegister = "users/signin"
const urlAdminNotifications = "utils/notifications"
const urlNotifyAnnualDebtor = "annualpayments/notifydebtor/"
const urlNotifyMonthlyDebtor = "monthlypayments/notifydebtor/"
const urlNewExpenditure = "utils/expenditures/"

export default function Users() {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const payDate = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    const queryDte = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");

    const {
        register,
        handleSubmit,
    } = useForm({
        mode: "onBlur",
    });

    const {
        register: register4,
        handleSubmit: handleSubmit4,
        reset
    } = useForm({
        mode: "onBlur",
    });

    const {
        register: register2,
        handleSubmit: handleSubmit2
    } = useForm({
        mode: "onBlur",
    });

    useEffect(() => {
        function axiosData() {
            axios.get(urlUser)
                .then(response => {
                    setUser(response.data);
                })
                .catch(error => {
                    console.log(error);
                    toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                })
        }
        axiosData();

    }, [])

    const login = (e) => {
        axios.post(urlUserLogin, { dni: e.dni, password: e.password })
            .then(response => {
                Swal.fire({
                    icon: "success",
                    title: "Login correcto!",
                    showConfirmButton: false,
                    timer: 1500
                });

                sessionStorage.setItem("temp", response.data.token);
                setUser(response.data);
                const idUser = response.data.id_user;
                if (response.data.is_admin) {
                    axios.get(urlAdminNotifications)
                        .then(response => {

                            const merchReq = response.data.merchReq;
                            const inscReq = response.data.inscReq;

                            if (merchReq.merch > 0 || inscReq.insc > 0) {
                                MySwal.fire({
                                    title: "Tienes nuevas notificaciones! Deseas verlas?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#3085d6",
                                    cancelButtonColor: "#d33",
                                    confirmButtonText: "Ir"
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        navigate("/adminnotifications");
                                    } else {
                                        navigate("/");
                                    }
                                });
                            }
                        })
                        .catch(error => {
                            toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                            console.log(error)
                        })
                    return navigate("/");
                }

                if (date.getDate() > 16) {
                    axios.get(urlNotifyMonthlyDebtor + idUser + "/" + queryDte)
                        .then(async response => {
                            if (response.data != "") {
                                await Swal.fire({
                                    icon: "warning",
                                    title: response.data,
                                    showConfirmButton: true
                                });
                            }
                            axios.get(urlNotifyAnnualDebtor + idUser + "/" + queryDte)
                                .then(response => {
                                    if (response.data != "") {
                                        Swal.fire({
                                            icon: "warning",
                                            title: response.data,
                                            showConfirmButton: true
                                        });
                                    }
                                })
                                .catch(error => {
                                    console.log(error);
                                    toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                                })

                        })
                        .catch(error => {
                            console.log(error);
                            toast.error('Ocurrió un error inesperado. Intenta de nuevo');
                        })
                }
                navigate("/");
            })
            .catch(error => {
                console.log(error);
                if (error.response.status === 401) {
                    return toast.error(error.response.data.error);
                }
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
            })
    }

    const newRegister = (e) => {
        const telContact = `54${e.tel_pre}15${e.tel_contact}`

        if (e.password !== e.repassword) return toast.error('Los passwords no coinciden. Intenta de nuevo');
        axios.post(urlUserRegister, {
            first_name: e.first_name,
            last_name: e.last_name,
            email: e.email,
            birth_date: e.birth_date,
            password: e.password,
            dni: e.dni,
            tel_contact: telContact
        })
            .then(response => {
                Swal.fire({
                    icon: "success",
                    title: `Bienvenida/o ${response.data.last_name}!`,
                    showConfirmButton: true
                }).then(resp => {
                    sessionStorage.setItem("temp", response.data.token);
                    setUser(response.data);
                    navigate("/");
                })
            })
            .catch(error => {
                console.log(error);
                if (error.response.statusText && error.response.statusText === "Unauthorized") return toast.error(error.response.data.error);
                toast.error('Ocurrió un error inesperado. Intenta de nuevo');
            })
    }

    function newExpenditure(e) {
        axios.post(urlNewExpenditure, { descr: e.descr, amount: e.amount, payDate: payDate })
            .then(response => {
                toast.success('Se registró el egreso.');
                reset();
            })
            .catch(error => {
                console.log(error);
                toast.error('Ocurrió un error inesperado');
            })
    }

    return (
        <section className="cuenta-info">
            {
                !user ?
                    <>
                        <h1>* BIENVENIDOS a Gimnasia Deportiva de la Vecinal Republica del Oeste 🤸‍♀ *</h1>
                        <h3>Por favor, regístrese creando una cuenta a nombre de su hijo/a gimnasta. Esto nos permitirá establecer una comunicación más fluida sobre pagos, eventos, encargues y otros temas referidos a la dinámica del gimnasio.</h3>
                        <div className="cuenta-registrarse">
                            <h4 >Acceder usuario existente:</h4>
                            <form className="login-form" onSubmit={handleSubmit(login)}>
                                <input type="text" name="dni" placeholder="DNI *" inputMode="numeric" pattern="\d*" maxLength="8" minLength="8" title="Solo números. 8 dígitos."  {...register("dni", { required: true })} />
                                <input type="password" id="login-password" name="password" placeholder="Contraseña *" maxLength="8" pattern="[A-Za-z0-9]{8,8}" {...register("password", { required: true })} />
                                <button type="submit" className="cuenta-button">Acceder</button>
                            </form>
                            <Link to={"/passrestoration"} className="boton-forgot">Olvidaste tu contraseña?</Link>
                        </div>


                        <div className="cuenta-registrarse">
                            <h4 >Registrar cuenta nueva:</h4>
                            <form className="login-form" onSubmit={handleSubmit2(newRegister)}>
                                <input type="text" id="first_name" name="first_name" placeholder="Nombre *" maxLength="30" pattern="^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{3,30}$" title="No uses símbolos ni números. Min 3, Max 30 carácteres." {...register2("first_name", { required: true })} />
                                <input type="text" id="last_name" name="last_name" placeholder="Apellido *" maxLength="30" pattern="^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{3,30}$" title="No uses símbolos ni números. Min 3, Max 30 carácteres." {...register2("last_name", { required: true })} />
                                <input type="email" id="email" name="email" placeholder="Correo Electrónico" {...register2("email")} />

                                <p className="info-text-register">Recuerda que tu contraseña debe tener 8 carácteres alfanuméricos SIN símbolos.</p>
                                <input type="password" id="password" name="password" placeholder="Contraseña nueva *" maxLength="8" pattern="[A-Za-z0-9]{8,8}" {...register2("password", { required: true })} />
                                <input type="password" id="repassword" name="repassword" placeholder="Repite la contraseña nueva *" maxLength="8" pattern="[A-Za-z0-9]{8,8}" {...register2("repassword", { required: true })} />
                                <input type="date" id="birth_date" name="birth_date" placeholder="Fecha nacimiento *" {...register2("birth_date", { required: true })} />
                                <input id="dni" name="dni" placeholder="DNI *" type="text" inputMode="numeric" pattern="\d*" maxLength="8" minLength="8" title="Solo números. 8 dígitos." {...register2("dni", { required: true })} />
                                <p className="info-text-register">Teléfono ejemplo: 123 1234567</p>
                                <div className="telephone-container">
                                    <div className="tel-pre">
                                        <p className="info-text-register">0 -</p>
                                        <input type="text" className="tel-prefix" id="tel_pre" name="tel_pre" placeholder="Prefijo *" inputMode="numeric" pattern="\d*" maxLength="5" minLength="3" title="Solo números. min 3 max 5 dígitos." {...register2("tel_pre", { required: true })} />
                                    </div>
                                    <div className="telephone">
                                        <p className="info-text-register">15 -</p>
                                        <input type="text" className="tel_contact" id="tel_contact" name="tel_contact" placeholder="Teléfono *" inputMode="numeric" pattern="\d*" maxLength="7" minLength="7" title="Solo números. 7 dígitos." {...register2("tel_contact", { required: true })} />
                                    </div>
                                </div>

                                <button type="submit" className="cuenta-button" >Registrarse</button>
                            </form>
                        </div>
                    </> :
                    <div className="user-info-container">
                        <h1>Bienvenida/o {user.first_name}!</h1>

                        <div className="user-info">
                            <p>Nombre completo: {user.first_name} {user.last_name}</p>
                            <p>E-Mail: {user.email ? user.email : "Sin dato"}</p>
                            <p>Fecha de nacimiento: {new Date(user.birth_date).toLocaleDateString('en-GB')}</p>
                            <p>DNI: {user.dni}</p>
                            <p>Teléfono de contacto: {user.tel_contact}</p>
                            <p>Fecha de registro: {new Date(user.register_date).toLocaleDateString('en-GB')}</p>
                        </div>
                        <div className="user-info-buttons">
                            <NavLink to={`/updateuser`} className="cuenta-button" style={({ isActive }) => { return { fontWeight: isActive ? "bold" : "" } }}>Mi cuenta</NavLink>
                            <NavLink to={`/masinfo`} className="cuenta-button" style={({ isActive }) => { return { fontWeight: isActive ? "bold" : "" } }}>Más info</NavLink>
                        </div>

                        {user.is_admin === 1 &&
                            <div className="user-info-container">
                                <h2>Egresos:</h2>
                                <form onSubmit={handleSubmit4(newExpenditure)} className="checkout-form">
                                    <input type="text" name="descr" placeholder="Descripción o motivo" {...register4("descr", { required: true })} />
                                    <input type="number" name="amount" min={"0"} defaultValue={0} placeholder="Monto" {...register4("amount", { required: true })} />
                                    <button type="submit" className="cuenta-button">Ingresar egreso</button>
                                </form>

                                <NavLink to={`/daily`} className="get-debtors-button">Consultar caja diaria</NavLink>
                                <NavLink to={`/monthly`} className="get-debtors-button">Consultar caja mensual</NavLink>
                                <NavLink to={`/administrationdebtors`} className="get-debtors-button">Consultar deudores activos</NavLink>
                                <NavLink to={`/fees`} className="get-debtors-button">Tarifario</NavLink>
                                <NavLink to={`/`} className="info-button">Volver</NavLink>
                            </div>
                        }
                    </div>
            }
        </section>
    )
}