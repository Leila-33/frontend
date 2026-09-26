import apiFetch from "./apiFetch";

// ==========================================================
// RÉCUPÉRER UN ESSAI ROUTIER
// ==========================================================

export const getTestDrive = (testDriveId) => {
  return apiFetch(`/test-drives/${testDriveId}`, {
    method: "GET",
  });
};

// ==========================================================
// RÉCUPÉRER LA LISTE ADMIN DES ESSAIS ROUTIERS
// ==========================================================

export const getAdminTestDrives = (params) => {
  return apiFetch(`/admin/test-drives?${params.toString()}`, {
    method: "GET",
  });
};

// ==========================================================
// MODIFIER LE STATUT D'UN ESSAI ROUTIER - ADMIN
// ==========================================================

export const updateAdminTestDriveStatus = (testDriveId, status) => {
  return apiFetch(`/admin/test-drives/${testDriveId}/status`, {
    method: "POST",
    body: {
      status,
    },
  });
};

// ==========================================================
// MODIFIER LE STATUT D'UN ESSAI ROUTIER - CLIENT
// ==========================================================

export const updateTestDriveStatus = (testDriveId, status) => {
  return apiFetch(`/test-drives/${testDriveId}/status`, {
    method: "PATCH",
    body: {
      status,
    },
  });
};

// ==========================================================
// ANNULER UN ESSAI ROUTIER - CLIENT
// ==========================================================

export const cancelTestDrive = (testDriveId) => {
  return apiFetch(`/test-drives/${testDriveId}/cancel`, {
    method: "POST",
  });
};

// ==========================================================
// RÉCUPÉRER LES ESSAIS ROUTIERS DU CLIENT CONNECTÉ
// ==========================================================

export const getMyTestDrives = () => {
  return apiFetch("/test-drives/me", {
    method: "GET",
  });
};
