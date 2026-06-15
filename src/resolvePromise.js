// js like in dinnerplanner
import { runInAction } from "mobx";

export function resolvePromise(promise, promiseState) {
  // called synchronously from within a model action, so these are inside an action
  promiseState.promise = promise;
  promiseState.data = null;
  promiseState.error = null;

  // the resolution callbacks run later, outside any action, so wrap the
  // observable mutations in runInAction to satisfy enforceActions: "observed"
  function successACB(result) {
    if (promiseState.promise === promise) {
      runInAction(() => {
        promiseState.data = result;
      });
    }
  }

  function failureACB(error) {
    runInAction(() => {
      promiseState.error = error;
    });
  }

  if (promise) {
    promise.then(successACB).catch(failureACB);
  }
}
