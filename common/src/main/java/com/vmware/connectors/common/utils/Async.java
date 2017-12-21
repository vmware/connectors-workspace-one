/*
 * Copyright © 2017 VMware, Inc. All Rights Reserved.
 * SPDX-License-Identifier: BSD-2-Clause
 */

package com.vmware.connectors.common.utils;

import com.vmware.connectors.common.context.ContextHolder;
import org.slf4j.MDC;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;
import org.springframework.web.client.HttpStatusCodeException;
import rx.Single;
import rx.functions.Func1;

import java.util.Map;
import java.util.function.Function;

/**
 * Utility for Async operations
 *
 * @author Rob Worsnop
 */
public final class Async {
    private Async() {
        // Do not construct
    }

    /**
     * Converts a ListenableFuture object to a Single.
     *
     * @param future The future to convert
     * @param <T> The type of object being omitted
     * @return
     */
    public static <T> Single<T> toSingle(ListenableFuture<T> future) {
        // Remember the context from the calling thread
        Map<String, Object> callerContext = ContextHolder.getContext();
        // Remember the MDC from the calling thread
        Map<String, String> mdcMap = MDC.getCopyOfContextMap();
        return Single.<T>create(subscriber -> future.addCallback(new ListenableFutureCallback<T>() {
            @Override
            public void onFailure(Throwable ex) {
                subscriber.onError(ex);
            }

            @Override
            public void onSuccess(T result) {
                // Copy the context from the calling thread to the callback thread's context
                // unless the calling thread *is* the callback thread
                Map<String, Object> callbackContext = ContextHolder.getContext();
                boolean same = callerContext == callbackContext; // NOPMD I really do want identity
                if (!same) {
                    callbackContext.putAll(callerContext);
                    if (mdcMap != null) {
                        MDC.setContextMap(mdcMap);
                    }
                }
                try {
                    subscriber.onSuccess(result);
                } finally {
                    if (!same) {
                        callerContext.keySet().forEach(callbackContext::remove);
                        MDC.clear();
                    }
                }
            }
        }));
    }
}
