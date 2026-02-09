import { Provider } from "./Provider";
import { useGlobalValue } from "./useGlobalValue";
export class GlobalValue {
  static use = useGlobalValue
  static Provider = Provider;
}
