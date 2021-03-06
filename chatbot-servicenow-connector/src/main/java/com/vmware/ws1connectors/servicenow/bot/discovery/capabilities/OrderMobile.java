/*
 * Project Service Now Connector
 * (c) 2019-2020 VMware, Inc. All rights reserved.
 * SPDX-License-Identifier: BSD-2-Clause
 */

package com.vmware.ws1connectors.servicenow.bot.discovery.capabilities;

import com.vmware.connectors.common.payloads.response.Link;
import com.vmware.connectors.common.utils.ConnectorTextAccessor;
import com.vmware.ws1connectors.servicenow.constants.ServiceNowCategory;
import com.vmware.ws1connectors.servicenow.constants.WorkflowId;
import com.vmware.ws1connectors.servicenow.constants.WorkflowStep;
import com.vmware.ws1connectors.servicenow.domain.BotAction;
import com.vmware.ws1connectors.servicenow.domain.BotItem;
import org.springframework.http.HttpMethod;

import java.util.Locale;

import static com.google.common.base.Preconditions.checkNotNull;

public class OrderMobile implements BotCapability {
    private static final String ORDER_MOBILE = "orderMobile";
    private static final String ORDER_MOBILE_ACTION = "orderMobileAction";
    private final ConnectorTextAccessor connectorTextAccessor;
    private static final String REROUTING_URL_VALIDATE_MSG = "rerouting url can't be null";

    public OrderMobile(ConnectorTextAccessor connectorTextAccessor) {
        this.connectorTextAccessor = connectorTextAccessor;
    }

    @Override public BotItem describe(String routingPrefix, Locale locale) {
        return new BotItem.Builder()
                .setTitle(connectorTextAccessor.getTitle(ORDER_MOBILE, locale))
                .setDescription(connectorTextAccessor.getDescription(ORDER_MOBILE, locale))
                .setWorkflowId(WorkflowId.ORDER_MOBILES.getId())
                .addAction(getListOfMobilesAction(routingPrefix, locale))
                .setWorkflowStep(WorkflowStep.COMPLETE)
                .build();
    }

    public BotAction getListOfMobilesAction(String routingPrefix, Locale locale) {
        checkNotNull(routingPrefix, REROUTING_URL_VALIDATE_MSG);
        return new BotAction.Builder()
                .setTitle(connectorTextAccessor.getTitle(ORDER_MOBILE_ACTION, locale))
                .setDescription(connectorTextAccessor.getDescription(ORDER_MOBILE_ACTION, locale))
                .setType(HttpMethod.GET)
                .setUrl(new Link(routingPrefix + buildActionUrl(ServiceNowCategory.MOBILE)))
                .build();
    }
}
