/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const { connectorLogoURL } = require('../config/config')
const mfCommons = require('@vmw/mobile-flows-connector-commons')

/**
 * Return the discovery JSON response that describes the capabilities of this connector
 * @param  {any} req express request
 * @param  {any} res express response
 */
const discoveryController = (req, res) => {
  const baseURL = mfCommons.getConnectorBaseUrl(req)
  const discoveryJSON = {
    image: {
      href: `${connectorLogoURL(baseURL)}`
    },
    object_types: {
      card: {
        pollable: true,
        doc: {
          href: 'https://github.com/vmware-samples/card-connectors-guide/wiki/Card-Responses'
        },
        endpoint: {
          href: `${baseURL}/cards`
        }
      }
    }
  }
  mfCommons.log(discoveryJSON)
  res.json(discoveryJSON)
}

module.exports = {
  discoveryController
}
