const formatPhone = (phone) => {
    // phone brasil 11 91234-5678
    // phone brasil 44 91234-5678
    // phone brasil 41 91234-5678
    // phone brasil 82 91234-5678

    if (!phone) return "";

    let formattedPhone = phone.replace(/\D/g, "");

    if (formattedPhone.length > 11) {
        formattedPhone = formattedPhone.substring(0, 11);
    }

    if (formattedPhone.length > 0) {
        formattedPhone = `(${formattedPhone.substring(
            0,
            2
        )}) ${formattedPhone.substring(2, 7)}-${formattedPhone.substring(7)}`;
    }

    return formattedPhone;
};
export default formatPhone;
