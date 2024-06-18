import React from "react";

type BadgeProps = {
  status: string;
};

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getClassName = (status: BadgeProps["status"]) => {
    switch (status) {
      case "main":
        return "badge badge-primary";
      case "draft":
        return "badge badge-secondary";
      case "sub":
        return "badge";
    }
  };

  const getLabel = (status: BadgeProps["status"]) => {
    switch (status) {
      case "main":
        return "公開";
      case "sub":
        return "非公開";
      case "draft":
        return "下書き";
      default:
        return "";
    }
  };

  return <div className={getClassName(status)}>{getLabel(status)}</div>;
};
