// (C) 2019-2021 GoodData Corporation
import { JsonApiWorkspaceOutWithLinks } from "@gooddata/api-client-tiger";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

export const workspaceConverter = ({
    attributes,
    id,
}: JsonApiWorkspaceOutWithLinks): IWorkspaceDescriptor => {
    const workspace: IWorkspaceDescriptor = {
        description: attributes?.name || id,
        title: attributes?.name || id,
        id: id,
    };

    return workspace;
};
