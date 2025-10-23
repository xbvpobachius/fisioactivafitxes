export type Visit = {
  id: string;
  date: string;
  treatmentNotes: string;
  price: number;
};

export type Client = {
  id: string;
  name: string;
  surname: string;
  phone: string;
  dni: string;
  birthDate: string;
  address: string;
  city: string;
  postalCode: string;
  email: string;
  profession: string;
  pathologies: string;
  surgicalInterventions: string;
  medication: string;
  familyHistory: string;
  reasonForConsultation: string;
  history: Visit[];
};
