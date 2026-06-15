import { StyleSheet } from "react-native";
import { shared } from "./sharedStyles.js";

const styles = StyleSheet.create({
  ...shared,

  // map + search
  mapContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  mapSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 17,
    color: "#111827",
  },
  mapSearchIcon: {
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultsContainer: {
    marginBottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchResultsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 10,
  },
  searchResultInfo: {
    flex: 1,
    paddingVertical: 2,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  searchResultLocation: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  searchResultSeeMore: {
    marginLeft: 10,
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  searchResultSeeMoreText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  mapSearchIconText: {
    fontSize: 18,
  },
  mapSearchClearText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "700",
  },
  mapSection: {
    borderRadius: 14,
    overflow: "hidden",
    height: 420,
  },

  // attractions carousel
  carouselContainer: {
    minHeight: 300,
  },
  cardWrapper: {
    paddingBottom: 18,
  },
});

export default styles;
