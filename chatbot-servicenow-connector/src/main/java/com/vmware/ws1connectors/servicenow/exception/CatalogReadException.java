/*
 * Project Service Now Connector
 * (c) 2019-2020 VMware, Inc. All rights reserved.
 * SPDX-License-Identifier: BSD-2-Clause
 */

package com.vmware.ws1connectors.servicenow.exception;

public class CatalogReadException extends RuntimeException {
    public CatalogReadException(String message) {
        super(message);
    }

    public CatalogReadException(Throwable throwable) {
        super(throwable.getMessage());
    }
}
