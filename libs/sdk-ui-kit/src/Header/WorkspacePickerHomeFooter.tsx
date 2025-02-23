// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { Icon } from "../Icon";

/**
 * @internal
 */
export interface IWorkspacePickerHomeFooterProps {
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    className?: string;
    theme?: ITheme;
}

const WorkspacePickerHomeFooterComponent: React.FC<IWorkspacePickerHomeFooterProps> = ({
    children,
    className,
    href,
    onClick,
    theme,
}) => {
    const mergedClassNames = cx("gd-workspace-picker-home-footer", className);
    return (
        <a className={mergedClassNames} href={href} onClick={onClick}>
            <span className="icon-home">
                <Icon name="Home" color={theme?.palette?.complementary?.c7} />
            </span>
            {children}
        </a>
    );
};

/**
 * @internal
 */
export const WorkspacePickerHomeFooter = withTheme(WorkspacePickerHomeFooterComponent);
