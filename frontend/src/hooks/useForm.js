// custom hook for managing form state and validations. To get rid of repetitive code...
// https://medium.com/@priyankadaida/react-custom-hooks-vs-helper-functions-when-to-use-both-e40167325479
import { useState } from "react";

export function useForm(initialVals = {}, initialSuccessMessage = "") {

  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
  const [values, setVals] = useState(initialVals);
  const [successMessage, setSuccessMessage] = useState(initialSuccessMessage); // show success message if it exists
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  function handleSubmit(submitAction) {
    return async (event) => {
      event.preventDefault(); // stops page refresh on app
      setIsSubmitting(true); // form is actively submitting -> button changes state
      setSuccessMessage(""); // clear success message on new submit
      setErrorMessage(""); // clear error message on new submit
      try {
        await submitAction(values); // send creds to backend and wait till response. ex) await loginUser({ username, password })

      } catch (error) {
        setErrorMessage(error.message || "Something went wrong.");
      } finally {
        setIsSubmitting(false);  // goes back to normal button state
      }
    };
  }

  return{
    values,
    setVals,
    successMessage,
    errorMessage,
    setSuccessMessage,
    setErrorMessage,
    isSubmitting,
    handleSubmit,
  };
}


