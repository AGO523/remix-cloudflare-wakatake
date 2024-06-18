import React from "react";

type DeckBadgeProps = {
  status: string;
};

export const DeckBadge: React.FC<DeckBadgeProps> = ({ status }) => {
  const getClassName = (status: DeckBadgeProps["status"]) => {
    switch (status) {
      case "main":
        return "badge badge-primary";
      case "sub":
        return "badge badge-secondary";
    }
  };

  const getLabel = (status: DeckBadgeProps["status"]) => {
    switch (status) {
      case "main":
        return "メイン";
      case "sub":
        return "サブ";
      default:
        return "";
    }
  };

  return <div className={getClassName(status)}>{getLabel(status)}</div>;
};
