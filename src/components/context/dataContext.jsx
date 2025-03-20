import { createContext, useContext, useEffect, useState } from "react";
import axios from "../../config/axiosConfig";
import { toast } from 'react-toastify';

const UserContext = createContext(null);
const urlUser = "users/"

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        function axiosData() {
                axios.get(urlUser)
                    .then(response => {
                        setUser(response.data);
                    })
                    .catch(error => {
                        toast.error(error);
                    })
        }
        axiosData();
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);