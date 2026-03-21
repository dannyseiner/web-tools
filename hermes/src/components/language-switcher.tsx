import { useTranslation } from "@webtools/client";
import React from "react";

const LanguageSwitcher = () => {
  const { locale, changeLocale } = useTranslation();
  console.log("locale", locale);
  return (
    <div>
      <select value={locale} onChange={(e) => changeLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="cs">Čeština</option>
        <option value="de">Deutsch</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
