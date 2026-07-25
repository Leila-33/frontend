import {
  createContext,
  useState,
  useEffect
} from "react";

import {
  registerLoader
} from "../services/loaderService";


export const LoaderContext = createContext();



export const LoaderProvider = ({
  children
}) => {


  const [
    loading,
    setLoading
  ] = useState(false);



  useEffect(()=>{


    registerLoader(
      setLoading
    );


  },[]);



  return (

    <LoaderContext.Provider

      value={{
        loading
      }}

    >

      {children}

    </LoaderContext.Provider>

  );

};