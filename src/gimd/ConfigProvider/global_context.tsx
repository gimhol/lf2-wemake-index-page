import React from "react";
import type { IConfig } from "./IConfig";
import { global_theme } from "../Theme";

export const default_config: IConfig = { theme: global_theme, size: 's' }
export const global_context = React.createContext<IConfig>(default_config);
