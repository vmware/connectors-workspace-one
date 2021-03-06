/*
 * Project Workday Connector
 * (c) 2019-2020 VMware, Inc. All rights reserved.
 * SPDX-License-Identifier: BSD-2-Clause
 */
package com.vmware.ws1connectors.workday.forms;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ApproveForm {
    private static final String INVALID_TENANT_NAME_MESSAGE = "Tenant Name cannot be empty";

    private String comment;
    @NotBlank(message = INVALID_TENANT_NAME_MESSAGE)
    private String tenantName;
}
