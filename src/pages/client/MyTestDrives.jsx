import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  getMyTestDrives
} from "../../services/testDriveService";

import { TEST_DRIVE_STEPS, TEST_DRIVE_STAT_CARDS, TEST_DRIVE_TABS } from "../../constants/testDriveOptions";
import { getTestDriveStatusColor, getTestDriveStatusLabel, getTestDriveStatusClassName, getAppointmentLabel } from "../../utils/testDriveUtils";


export default function MyTestDrives() {

  const navigate = useNavigate();

  const [testDrives, setTestDrives] = useState([]);
  const [activeTab, setActiveTab] = useState("all");


  // ========================================================
  // COMPTER LES ESSAIS PAR STATUT
  // ========================================================

  const statusCounts = useMemo(() => {

    return testDrives.reduce(
      (acc, testDrive) => {

        acc[testDrive.status] =
          (acc[testDrive.status] || 0) + 1;

        return acc;

      },
      {}
    );

  }, [testDrives]);


  // ========================================================
  // TOTAL DES ESSAIS
  // ========================================================

  const totalTestDrives = testDrives.length;

  const statValues = {
    total: totalTestDrives,
    ...statusCounts,
  };
  // ========================================================
  // ESSAIS À VENIR
  // ========================================================

  const upcomingCount = useMemo(() => {

    return testDrives.filter(
      (testDrive) =>
        testDrive.status === "pending" ||
        testDrive.status === "confirmed"
    ).length;

  }, [testDrives]);


  // ========================================================
  // ONGLETS
  // ========================================================

  const tabs = useMemo(() => {

    return TEST_DRIVE_TABS.map((tab) => {

      if (tab.key === "all") {
        return {
          ...tab,
          count: totalTestDrives
        };
      }

      return {
        ...tab,
        count: statusCounts[tab.key] || 0
      };

    });

  }, [totalTestDrives, statusCounts]);


  // ========================================================
  // FILTRER ET TRIER
  // ========================================================

  const filteredTestDrives = useMemo(() => {

    const filtered =
      activeTab === "all"
        ? testDrives
        : testDrives.filter(
          (testDrive) =>
            testDrive.status === activeTab
        );

    // On crée une copie avant le tri
    // afin de ne jamais modifier directement le state.
    return [...filtered].sort(
      (a, b) =>
        new Date(b.appointment_date) -
        new Date(a.appointment_date)
    );

  }, [testDrives, activeTab]);


  // ========================================================
  // CHARGER LES ESSAIS ROUTIERS
  // ========================================================

  const fetchTestDrives = useCallback(
    async () => {

      try {


        const data = await getMyTestDrives();

        setTestDrives(data);

      } catch (err) {

        toast.error(
          err?.message ||
          "Erreur lors du chargement des essais routiers"
        );

      }

    },
    []
  );


  useEffect(() => {
    fetchTestDrives();
  }, [fetchTestDrives]);


  // ========================================================
  // OUVRIR LE DÉTAIL
  // ========================================================

  const handleViewDetails = (testDriveId) => {
    navigate(`/test-drives/${testDriveId}`);
  };


  // ========================================================
  // RENDRE LA PROGRESSION
  // ========================================================

  const getProgress = (status) => {

    if (
      status === "rejected" ||
      status === "cancelled"
    ) {
      return 0;
    }

    const stepIndex =
      TEST_DRIVE_STEPS.findIndex(
        (step) => step.key === status
      );

    if (stepIndex === -1) {
      return 0;
    }

    return (
      stepIndex /
      (TEST_DRIVE_STEPS.length - 1)
    ) * 100;
  };


  // ========================================================
  // UI
  // ========================================================

  return (

    <div className="container py-4 py-lg-5">


      {/* ==================================================
          HEADER
          ================================================== */}

      <div
        className="
          d-flex
          flex-column
          flex-lg-row
          justify-content-between
          align-items-lg-end
          gap-3
          mb-4
        "
      >

        <div>

          <div
            className="
              d-inline-flex
              align-items-center
              gap-2
              text-primary
              fw-semibold
              small
              mb-2
            "
          >

            <i className="bi bi-car-front-fill" />

            MES RENDEZ-VOUS

          </div>


          <h1
            className="
              fw-bold
              mb-2
              display-6
            "
          >
            Mes essais routiers
          </h1>


          <p className="text-muted mb-0">

            Consultez et suivez facilement
            vos demandes d'essai.

          </p>

        </div>


        {/* PETIT INDICATEUR */}

        {totalTestDrives > 0 && (

          <div
            className="
              d-flex
              align-items-center
              gap-3
              bg-light
              rounded-4
              px-3
              py-2
            "
          >

            <div
              className="
                d-flex
                align-items-center
                justify-content-center
                bg-primary
                text-white
                rounded-circle
              "
              style={{
                width: "40px",
                height: "40px"
              }}
            >
              <i className="bi bi-calendar-check" />
            </div>


            <div>

              <div className="fw-bold">
                {upcomingCount}
              </div>

              <small className="text-muted">
                rendez-vous à venir
              </small>

            </div>

          </div>

        )}

      </div>


      {/* ==================================================
          STATISTIQUES
          ================================================== */}

      {totalTestDrives > 0 && (
        <div className="row g-3 mb-4">
          {TEST_DRIVE_STAT_CARDS.map((stat) => (
            <div
              key={stat.key}
              className="col-6 col-lg-3"
            >
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3 p-lg-4">
                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <small className="text-muted">
                        {stat.label}
                      </small>

                      <h3 className="fw-bold mb-0 mt-1">
                        {statValues[stat.key] ?? 0}
                      </h3>
                    </div>

                    <div
                      className={`
                  d-flex
                  align-items-center
                  justify-content-center
                  rounded-3
                  ${stat.colorClass}
                `}
                      style={{
                        width: "44px",
                        height: "44px",
                      }}
                    >
                      <i
                        className={`bi ${stat.icon} fs-5`}
                        aria-hidden="true"
                      />
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* ==================================================
          FILTRES
          ================================================== */}

      {totalTestDrives > 0 && (

        <div
          className="
            bg-white
            border
            rounded-4
            p-2
            mb-4
          "
        >

          <div
            className="
              d-flex
              gap-2
              overflow-auto
              pb-1
            "
          >

            {tabs.map((tab) => (

              <button
                key={tab.key}
                type="button"
                className={`
                  btn
                  rounded-3
                  px-3
                  py-2
                  text-nowrap
                  ${activeTab === tab.key
                    ? "btn-primary"
                    : "btn-light"
                  }
                `}
                onClick={() =>
                  setActiveTab(tab.key)
                }
              >

                <i
                  className={`${tab.icon} me-2`}
                />

                {tab.label}

                <span
                  className={`
                    ms-2
                    badge
                    rounded-pill
                    ${activeTab === tab.key
                      ? "bg-white text-primary"
                      : "bg-secondary-subtle text-secondary"
                    }
                  `}
                >
                  {tab.count}
                </span>

              </button>

            ))}

          </div>

        </div>

      )}


      {/* ==================================================
          AUCUN RÉSULTAT
          ================================================== */}

      {filteredTestDrives.length === 0 ? (

        <div
          className="
            card
            border-0
            shadow-sm
            rounded-4
          "
        >

          <div
            className="
              card-body
              text-center
              py-5
              px-4
            "
          >

            <div
              className="
                d-flex
                align-items-center
                justify-content-center
                bg-light
                text-primary
                rounded-circle
                mx-auto
                mb-3
              "
              style={{
                width: "72px",
                height: "72px"
              }}
            >

              <i
                className="
                  bi bi-calendar2-x
                  fs-2
                "
              />

            </div>


            <h4 className="fw-bold mb-2">
              Aucun essai routier
            </h4>


            <p
              className="
                text-muted
                mb-4
                mx-auto
              "
              style={{
                maxWidth: "450px"
              }}
            >
              {activeTab === "all"
                ? "Vous n'avez encore aucune demande d'essai routier."
                : "Aucun essai routier ne correspond à ce filtre."
              }
            </p>


            {activeTab !== "all" && (

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() =>
                  setActiveTab("all")
                }
              >
                Voir tous les essais
              </button>

            )}

          </div>

        </div>

      ) : (

        /* ==================================================
           LISTE DES ESSAIS
           ================================================== */

        <div className="row g-4">

          {filteredTestDrives.map((testDrive) => {

            const progress =
              getProgress(testDrive.status);


            const isCancelled =
              testDrive.status === "cancelled";


            const isRejected =
              testDrive.status === "rejected";


            return (

              <div
                className="col-md-6 col-xl-4"
                key={testDrive.id}
              >

                <div
                  className="
                    card
                    border-0
                    shadow-sm
                    rounded-4
                    h-100
                    overflow-hidden
                  "
                >

                  {/* ======================================
                      CARD HEADER
                      ====================================== */}

                  <div
                    className="
                      card-body
                      p-4
                    "
                  >

                    <div
                      className="
                        d-flex
                        justify-content-between
                        align-items-start
                        gap-3
                      "
                    >

                      <div className="min-w-0">

                        <div
                          className="
                            d-flex
                            align-items-center
                            gap-2
                            mb-2
                          "
                        >

                          <div
                            className="
                              d-flex
                              align-items-center
                              justify-content-center
                              bg-primary-subtle
                              text-primary
                              rounded-3
                            "
                            style={{
                              width: "40px",
                              height: "40px"
                            }}
                          >

                            <i className="bi bi-car-front-fill" />

                          </div>


                          <small
                            className="
                              text-muted
                              fw-semibold
                            "
                          >
                            ESSAI ROUTIER
                          </small>

                        </div>


                        <h5
                          className="
                            fw-bold
                            mb-0
                            text-truncate
                          "
                          title={testDrive.vehicle_name}
                        >
                          {testDrive.vehicle_name}
                        </h5>

                      </div>


                      <span
                        className={`
                          badge
                          rounded-pill
                          px-3
                          py-2
                          ${getTestDriveStatusClassName(testDrive.status)}
                        `}
                      >
                        {getTestDriveStatusLabel(testDrive.status)}
                      </span>

                    </div>


                    {/* ==================================
                        DATE
                        ================================== */}

                    <div
                      className="
                        d-flex
                        align-items-center
                        gap-3
                        bg-light
                        rounded-3
                        p-3
                        mt-4
                      "
                    >

                      <div
                        className="
                          d-flex
                          align-items-center
                          justify-content-center
                          bg-white
                          text-primary
                          rounded-3
                        "
                        style={{
                          width: "42px",
                          height: "42px"
                        }}
                      >
                        <i className="bi bi-calendar-event fs-5" />
                      </div>


                      <div>

                        <small className="text-muted d-block">
                          Rendez-vous
                        </small>

                        <span className="fw-semibold">
                          {getAppointmentLabel(
                            testDrive
                          )}
                        </span>

                      </div>

                    </div>


                    {/* ==================================
                        PROGRESSION
                        ================================== */}

                    {!isCancelled &&
                      !isRejected && (

                        <div className="mt-4">

                          <div
                            className="
                            d-flex
                            justify-content-between
                            align-items-center
                            mb-2
                          "
                          >

                            <small
                              className="
                              text-muted
                              fw-semibold
                            "
                            >
                              Progression
                            </small>

                            <small
                              className="
                              text-muted
                            "
                            >
                              {Math.round(progress)}%
                            </small>

                          </div>


                          <div
                            className="
                            progress
                            mb-3
                          "
                            style={{
                              height: "7px"
                            }}
                          >

                            <div
                              className={`
                              progress-bar
                              ${getTestDriveStatusColor(testDrive.status) || ""}
                            `}
                              role="progressbar"
                              style={{
                                width: `${progress}%`
                              }}
                            />

                          </div>


                          <div
                            className="
                            d-flex
                            justify-content-between
                          "
                          >

                            {TEST_DRIVE_STEPS.map(
                              (step, index) => {

                                const currentStep =
                                  TEST_DRIVE_STEPS.findIndex(
                                    (item) =>
                                      item.key ===
                                      testDrive.status
                                  );


                                const completed =
                                  currentStep >= index;


                                return (

                                  <div
                                    key={step.key}
                                    className="
                                    d-flex
                                    flex-column
                                    align-items-center
                                    gap-1
                                  "
                                    style={{
                                      width: "33%"
                                    }}
                                  >

                                    <div
                                      className={`
                                      d-flex
                                      align-items-center
                                      justify-content-center
                                      rounded-circle
                                      ${completed
                                          ? "bg-primary text-white"
                                          : "bg-light text-muted"
                                        }
                                    `}
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        fontSize: "13px"
                                      }}
                                    >

                                      <i
                                        className={
                                          step.icon
                                        }
                                      />

                                    </div>


                                    <small
                                      className={`
                                      text-center
                                      ${completed
                                          ? "text-dark fw-semibold"
                                          : "text-muted"
                                        }
                                    `}
                                    >
                                      {step.label}
                                    </small>

                                  </div>

                                );

                              }
                            )}

                          </div>

                        </div>

                      )}


                    {/* ==================================
                        STATUT ANNULÉ / REFUSÉ
                        ================================== */}

                    {(isCancelled ||
                      isRejected) && (

                        <div
                          className="
                          alert
                          alert-light
                          border
                          rounded-3
                          mt-4
                          mb-0
                          d-flex
                          align-items-center
                          gap-2
                        "
                        >

                          <i
                            className={
                              isCancelled
                                ? "bi bi-x-circle text-danger"
                                : "bi bi-exclamation-circle text-danger"
                            }
                          />

                          <small className="text-muted">

                            {isCancelled
                              ? "Cet essai routier a été annulé."
                              : "Cette demande d'essai routier a été refusée."
                            }

                          </small>

                        </div>

                      )}


                    {/* ==================================
                        COMMENTAIRE
                        ================================== */}

                    {testDrive.comment && (

                      <div
                        className="
                          border-top
                          mt-4
                          pt-3
                        "
                      >

                        <div
                          className="
                            d-flex
                            gap-2
                          "
                        >

                          <i
                            className="
                              bi
                              bi-chat-left-text
                              text-muted
                              mt-1
                            "
                          />

                          <small
                            className="
                              text-muted
                            "
                          >
                            {testDrive.comment}
                          </small>

                        </div>

                      </div>

                    )}

                  </div>


                  {/* ======================================
                      FOOTER
                      ====================================== */}

                  <div
                    className="
                      card-footer
                      bg-white
                      border-top
                      px-4
                      py-3
                    "
                  >

                    <button
                      type="button"
                      className="
                        btn
                        btn-outline-primary
                        w-100
                        rounded-3
                      "
                      onClick={() =>
                        handleViewDetails(
                          testDrive.id
                        )
                      }
                    >

                      Voir les détails

                      <i
                        className="
                          bi
                          bi-arrow-right
                          ms-2
                        "
                      />

                    </button>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}