import { StyleSheet } from "react-native";
import { shared } from "./sharedStyles.js";

const styles = StyleSheet.create({
  ...shared,

  // weather banner
  weatherBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weatherDay: {
    backgroundColor: "#0ea5e9",
  },
  weatherNight: {
    backgroundColor: "#1e1b4b",
  },
  weatherEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.75)",
  },
  weatherTemp: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
  },
  weatherCondition: {
    marginTop: 4,
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  weatherAside: {
    alignItems: "flex-end",
  },
  weatherTextNight: {
    color: "#ffffff",
  },
  weatherRangeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  weatherRange: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  weatherBannerPressed: {
    opacity: 0.92,
  },
  weatherTapHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },

  // loading / alerts
  loadingText: {
    marginHorizontal: 16,
    marginTop: 8,
    color: "#475569",
    fontSize: 14,
  },
  alertBox: {
    backgroundColor: "#fee2e2",
    padding: 12,
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  alertTitle: {
    color: "#991b1b",
    fontWeight: "700",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fecaca",
  },
  closeButtonText: {
    fontSize: 14,
    color: "#991b1b",
    fontWeight: "700",
  },
  alertDescription: {
    color: "#7f1d1d",
  },
  buttonWrapper: {
    marginTop: 14,
    marginHorizontal: 16,
  },
  refreshButton: {
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  refreshButtonPressed: {
    opacity: 0.85,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  // news
  newsSectionHeader: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newsRefreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  newsRefreshIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  newsSection: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  newsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  newsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  newsBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
    backgroundColor: "#96a4e7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 25,
  },
  newsSeverity: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b45309",
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  newsDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  newsMeta: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
  },
  emptyNewsText: {
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 20,
  },
  newsShowMoreButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  newsShowMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  // weather modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "flex-end",
  },
  modalOverlay: {
    flex: 1,
  },
  weatherModalSheet: {
    maxHeight: "88%",
    backgroundColor: "#060d1f",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 28,
  },
  weatherModalDay: {
    backgroundColor: "#0ea5e9",
  },
  weatherModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  weatherModalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  weatherModalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  weatherModalCloseText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  weatherModalContent: {
    paddingBottom: 30,
  },
  weatherHeroCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },
  weatherHeroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  weatherHeroRight: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 6,
    gap: 6,
  },
  weatherHeroFeelsLike: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  weatherHeroPrecip: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  umbrellaTip: {
    backgroundColor: "rgba(14,165,233,0.2)",
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.35)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  umbrellaTipText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  weatherHeroEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.7)",
  },
  weatherHeroTemp: {
    marginTop: 6,
    fontSize: 42,
    fontWeight: "800",
    color: "#ffffff",
  },
  weatherHeroCondition: {
    marginTop: 6,
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
  },
  weatherHeroRange: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
  },
  weatherLoadingBlock: {
    paddingVertical: 24,
    alignItems: "center",
  },
  weatherLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "rgba(255,255,255,0.82)",
  },
  weatherMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  weatherMetricCard: {
    width: "48%",
    minHeight: 210,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 26,
    padding: 18,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  uvMetricCard: {
    backgroundColor: "rgba(251,191,36,0.18)",
    borderColor: "rgba(251,191,36,0.25)",
  },
  humidityMetricCard: {
    backgroundColor: "rgba(14,165,233,0.18)",
    borderColor: "rgba(14,165,233,0.25)",
  },
  humidityMetricCardDay: {
    backgroundColor: "#0ea5e9",
    borderColor: "rgba(255,255,255,0.12)",
  },
  windMetricCard: {
    backgroundColor: "rgba(148,163,184,0.18)",
    borderColor: "rgba(148,163,184,0.25)",
  },
  windMetricCardDay: {
    backgroundColor: "#0ea5e9",
    borderColor: "rgba(255,255,255,0.12)",
  },
  aqiMetricCard: {
    backgroundColor: "rgba(34,197,94,0.18)",
    borderColor: "rgba(34,197,94,0.25)",
  },
  weatherMetricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.82)",
  },
  weatherMetricDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
  },
  weatherMetricValue: {
    marginTop: 14,
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
  },
  weatherMetricValueSmall: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  uvBarTrack: {
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  uvBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  humidityBarTrack: {
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  humidityBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#7dd3fc",
  },
  weatherSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
    marginTop: 8,
  },
  forecastList: {
    marginTop: 4,
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  forecastDay: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  forecastCondition: {
    marginTop: 2,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  forecastTemps: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  emptyForecastText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 20,
  },

  // sun arc card
  sunCard: {
    height: 250,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingBottom: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  sunCurveWrapper: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 8,
  },
  sunSvg: {
    width: "100%",
    height: 140,
  },
  sunCurveGlow: {
    position: "absolute",
    top: 32,
    width: "70%",
    height: 95,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    backgroundColor: "rgba(250, 204, 21, 0.31)",
  },
  sunCurveArc: {
    position: "absolute",
    top: 28,
    width: "70%",
    height: 99,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    borderWidth: 6,
    borderBottomWidth: 0,
    borderColor: "#ffdb11",
    backgroundColor: "transparent",
  },
  sunHorizon: {
    position: "absolute",
    bottom: 18,
    width: "110%",
    height: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  sunTimesRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sunTimesRight: {
    alignItems: "flex-end",
  },
  sunTimeLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
    marginBottom: 6,
  },
  sunTimeValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },

  // travel advisory card
  advisoryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  advisoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  advisorySource: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  advisoryDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  advisoryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  advisoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  // UK badge colors
  advisoryBadgeUKGreen: {
    backgroundColor: "#166534",
  },
  advisoryBadgeUKRed: {
    backgroundColor: "#7f1d1d",
  },
  // US level badge colors
  advisoryBadgeUSL1: {
    backgroundColor: "#166534",
  },
  advisoryBadgeUSL2: {
    backgroundColor: "#854d0e",
  },
  advisoryBadgeUSL3: {
    backgroundColor: "#9a3412",
  },
  advisoryBadgeUSL4: {
    backgroundColor: "#7f1d1d",
  },
  advisoryBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  advisoryIconBtn: {
    padding: 4,
  },
  advisoryIconText: {
    fontSize: 16,
    color: "#64748b",
  },
  advisoryExpandedContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 10,
    gap: 6,
  },
  advisoryAlertItem: {
    fontSize: 13,
    color: "#fca5a5",
    lineHeight: 18,
  },
  advisoryDisclaimer: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 10,
    color: "#94a3b8",
    lineHeight: 14,
  },
});

export default styles;
