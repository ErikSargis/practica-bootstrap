"use strict";

const municipisPerProvincia = {
    Barcelona: ["Barcelona", "Badalona", "Terrassa", "Sabadell"],
    Girona: ["Girona", "Figueres", "Blanes", "Olot"],
    Lleida: ["Lleida", "Balaguer", "Tàrrega", "La Seu d'Urgell"],
    Tarragona: ["Tarragona", "Reus", "Tortosa", "El Vendrell"]
};

const formulari = document.getElementById("formulariAlta");
const provincia = document.getElementById("provincia");
const municipi = document.getElementById("municipi");
const dataNaixement = document.getElementById("dataNaixement");
const contrasenya = document.getElementById("contrasenya");
const targetaResum = document.getElementById("targetaResum");
const campsValidables = [
    "nom",
    "cognoms",
    "dni",
    "dataNaixement",
    "provincia",
    "municipi",
    "email",
    "contrasenya",
    "confirmarContrasenya",
    "acceptaTermes"
];

function obtenirCamp(id) {
    return document.getElementById(id);
}

function validarDni(valor) {
    const coincidencia = valor.trim().toUpperCase().match(/^(\d{8})([A-Z])$/);
    if (!coincidencia) {
        return false;
    }

    const lletresDni = "TRWAGMYFPDXBNJZSQVHLCKE";
    return lletresDni[Number(coincidencia[1]) % 23] === coincidencia[2];
}

function convertirData(valor) {
    if (!valor) {
        return null;
    }

    const [any, mes, dia] = valor.split("-").map(Number);
    const data = new Date(any, mes - 1, dia);
    if (data.getFullYear() !== any || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
        return null;
    }

    return data;
}

function calcularEdat(data) {
    const avui = new Date();
    let edat = avui.getFullYear() - data.getFullYear();
    const encaraNoHaFetAnys =
        avui.getMonth() < data.getMonth() ||
        (avui.getMonth() === data.getMonth() && avui.getDate() < data.getDate());

    if (encaraNoHaFetAnys) {
        edat -= 1;
    }

    return edat;
}

function obtenirError(id) {
    const camp = obtenirCamp(id);

    switch (id) {
        case "nom":
        case "cognoms":
            return camp.value.trim() ? "" : "Aquest camp és obligatori.";
        case "dni":
            return validarDni(camp.value) ? "" : "El DNI no és vàlid.";
        case "dataNaixement": {
            const data = convertirData(camp.value);
            if (!data) {
                return "Introdueix una data vàlida.";
            }

            const avui = new Date();
            avui.setHours(0, 0, 0, 0);
            if (data > avui) {
                return "La data no pot ser futura.";
            }
            return calcularEdat(data) >= 18 ? "" : "Has de tenir almenys 18 anys.";
        }
        case "provincia":
            return municipisPerProvincia[camp.value] ? "" : "Selecciona una província.";
        case "municipi":
            return !camp.disabled && camp.value ? "" : "Selecciona un municipi.";
        case "email":
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(camp.value.trim())
                ? ""
                : "Introdueix un correu electrònic vàlid.";
        case "contrasenya":
            return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(camp.value)
                ? ""
                : "Fes servir almenys 8 caràcters, una majúscula i un número.";
        case "confirmarContrasenya":
            return camp.value && camp.value === contrasenya.value
                ? ""
                : "Les contrasenyes han de coincidir.";
        case "acceptaTermes":
            return camp.checked ? "" : "Has d'acceptar els termes per registrar-te.";
        default:
            return "Aquest camp no és vàlid.";
    }
}

function validarCamp(id) {
    const camp = obtenirCamp(id);
    const error = obtenirError(id);
    const feedback = camp.parentElement.querySelector(".invalid-feedback");

    camp.classList.toggle("is-invalid", Boolean(error));
    camp.classList.toggle("is-valid", !error);
    if (feedback && error) {
        feedback.textContent = error;
    }

    return !error;
}

function actualitzarMunicipis() {
    const opcions = municipisPerProvincia[provincia.value] || [];
    municipi.replaceChildren();

    const opcioInicial = document.createElement("option");
    opcioInicial.value = "";
    opcioInicial.textContent = opcions.length
        ? "Tria un municipi..."
        : "Tria primer una província...";
    municipi.append(opcioInicial);

    for (const nomMunicipi of opcions) {
        const opcio = document.createElement("option");
        opcio.value = nomMunicipi;
        opcio.textContent = nomMunicipi;
        municipi.append(opcio);
    }

    municipi.disabled = opcions.length === 0;
    municipi.classList.remove("is-valid", "is-invalid");
}

function afegirDadaResum(llista, etiqueta, valor) {
    const element = document.createElement("li");
    element.className = "list-group-item";

    const nom = document.createElement("strong");
    nom.textContent = `${etiqueta}: `;
    element.append(nom, document.createTextNode(valor));
    llista.append(element);
}

function mostrarResum() {
    const data = convertirData(dataNaixement.value);
    const edat = calcularEdat(data);
    const targeta = document.createElement("div");
    targeta.className = "card shadow-sm";

    const cos = document.createElement("div");
    cos.className = "card-body";

    const titol = document.createElement("h2");
    titol.className = "h4 card-title";
    titol.textContent = "Registre completat";

    const text = document.createElement("p");
    text.className = "card-text";
    text.textContent = "Les teves dades s'han validat correctament.";

    const llista = document.createElement("ul");
    llista.className = "list-group list-group-flush";
    afegirDadaResum(llista, "Nom", obtenirCamp("nom").value.trim());
    afegirDadaResum(llista, "Cognoms", obtenirCamp("cognoms").value.trim());
    afegirDadaResum(llista, "DNI", obtenirCamp("dni").value.trim().toUpperCase());
    afegirDadaResum(llista, "Data de naixement", dataNaixement.value);
    afegirDadaResum(llista, "Edat", `${edat} anys`);
    afegirDadaResum(llista, "Correu electrònic", obtenirCamp("email").value.trim());
    afegirDadaResum(llista, "Província", provincia.value);
    afegirDadaResum(llista, "Municipi", municipi.value);

    cos.append(titol, text, llista);
    targeta.append(cos);
    targetaResum.replaceChildren(targeta);
    targetaResum.classList.remove("d-none");
    targetaResum.focus();
}

provincia.addEventListener("change", () => {
    actualitzarMunicipis();
    validarCamp("provincia");
});

formulari.addEventListener("input", (event) => {
    const id = event.target.id;
    if (campsValidables.includes(id)) {
        validarCamp(id);
        if (id === "contrasenya" && obtenirCamp("confirmarContrasenya").value) {
            validarCamp("confirmarContrasenya");
        }
    }
});

formulari.addEventListener("change", (event) => {
    const id = event.target.id;
    if (campsValidables.includes(id)) {
        validarCamp(id);
    }
});

formulari.addEventListener("submit", (event) => {
    event.preventDefault();

    let primerCampInvalid = null;
    for (const id of campsValidables) {
        if (!validarCamp(id) && !primerCampInvalid) {
            primerCampInvalid = obtenirCamp(id);
        }
    }

    if (primerCampInvalid) {
        primerCampInvalid.focus();
        return;
    }

    formulari.classList.add("d-none");
    mostrarResum();
});
