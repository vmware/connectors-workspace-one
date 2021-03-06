/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const { describe } = require('mocha')
const { expect } = require('chai')
const sinon = require('sinon')
const chai = require('chai')
const nock = require('nock')
const { getUserInfo, getAssignedTickets, getTicketStagesMap, getPagedTickets,performActionOnTicket, getContactNamesOfTicket, getCompanyInfoFromId,getHubSpotIdFromMail,updateTicketStatus} = require('../../services/hubspot-services')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)

describe('Service API tests', () => {
  describe('getUserInfo', () => {
    it('Get userInfo', async () => {
      nock('https://api.hubapi.com')
        .get(url => url.includes('access-tokens'))
        .reply(200, userInfoMockResp)
      const response = await getUserInfo({
        connectorAuthorization: 'Bearer connectorAuthorizationValue',
        apiBaseUrl: 'https://api.hubapi.com',
        mfJwt: { email: 'srini.gargeya@vmware.com' }
      })
      expect(typeof response).to.equal('object')
      expect(response.user).to.equal('kumar@backflipt.com')
    })

    it('get userInfo in network error', async () => {
      nock('https://api.hubapi.com')
      .get(url => url.includes('access-tokens'))
      .reply(404,{
        "status": "error",
        "message": "The access token is expired or invalid"
      })
      try {
        await getUserInfo({
          connectorAuthorization: 'Bearer connectorAuthorizationValue',
          apiBaseUrl: 'https://api.hubapi.com',
          mfJwt: { email: 'srini.gargeya@vmware.com' }
        })
        sinon.assert.fail('getUserInfo should throw exception. so this path should not be reachable')
      } catch (err) {
        const error = JSON.parse(err.message)
        expect(error.statusCode).to.equal(401)
      }
    })
  })

  describe('getHubSpotIdFromMail', () => {
    it('Get getHubSpotIdFromMail', async () => {
      nock('https://api.hubapi.com')
        .get('/crm/v3/owners')
        .reply(200, ownersList)
      const response = await getHubSpotIdFromMail({
        connectorAuthorization: 'Bearer connectorAuthorizationValue',
        apiBaseUrl: 'https://api.hubapi.com',
        mfJwt: { email: 'srini.gargeya@vmware.com' }
      },"kumar@backflipt.com")
      expect(typeof response).to.equal('object')
      expect(response.id).to.equal('50035835')
    })

    it('get getHubSpotIdFromMail in network error', async () => {
      nock('https://api.hubapi.com')
      .get('/crm/v3/owners')
      .reply(401)
      try {
        await getHubSpotIdFromMail({
          connectorAuthorization: 'Bearer connectorAuthorizationValue',
          apiBaseUrl: 'https://api.hubapi.com',
          mfJwt: { email: 'srini.gargeya@vmware.com' }
        },"kumar@backflipt.com")
        sinon.assert.fail('getHubSpotIdFromMail should throw exception. so this path should not be reachable')
      } catch (err) {
        const error = JSON.parse(err.message)
        expect(error.statusCode).to.equal(401)
      }
    })
  })

  describe('getAssignedTickets', () => {
    it('getAssignedTickets valid flow', async () => {
       nock('https://api.hubapi.com')
        .get("/crm/v3/objects/tickets")
        .query(true)
        .reply(200, activeTicketsWithOutPagination)
      const response = await getAssignedTickets({
        connectorAuthorization: 'Bearer connectorAuthorizationValue',
        apiBaseUrl: 'https://api.hubapi.com',
        mfJwt: { email: 'srini.gargeya@vmware.com' }
      }, '50035835' )
      expect(typeof response).to.equal('object')
    })

    it('getAssignedTickets in network error', async () => {
      nock('https://api.hubapi.com')
        .get("/crm/v3/objects/tickets")
        .query(true)
        .reply(401)
      try {
        await getAssignedTickets({
          connectorAuthorization: 'Bearer connectorAuthorizationValue',
          apiBaseUrl: 'https://api.hubapi.com',
          mfJwt: { email: 'srini.gargeya@vmware.com' }
        }, '50035835' )
        sinon.assert.fail('getMyOpenCases should throw exception. so this path should not be reachable')
      } catch (err) {
        const error = JSON.parse(err.message)
        expect(error.statusCode).to.equal(401)
      }
    })
  })

  describe('getPagedTickets', () => {
    it('getPagedTickets valid flow', async () => {
       nock('https://api.hubapi.com/crm/v3/objects/tickets')
        .get(url => url.includes("associations=Contact&associations=Company&limit=1&after=180209489&properties=content%2Csubject%2Ccreateddate%2Chs_pipeline%2Chs_pipeline_stage%2Chs_ticket_priority%2Clast_reply_date%2Csource_type%2Chubspot_owner_id"))
        .reply(200, activeTicketsWithOutPagination)
      const response = await getPagedTickets({
        connectorAuthorization: 'Bearer connectorAuthorizationValue',
        apiBaseUrl: 'https://api.hubapi.com',
        mfJwt: { email: 'srini.gargeya@vmware.com' }
      }, 'https://api.hubapi.com/crm/v3/objects/tickets?associations=Contact&associations=Company&limit=1&after=180209489&properties=content%2Csubject%2Ccreateddate%2Chs_pipeline%2Chs_pipeline_stage%2Chs_ticket_priority%2Clast_reply_date%2Csource_type%2Chubspot_owner_id' )
      expect(typeof response).to.equal('object')
    })

    it('getAssignedTickets in network error', async () => {
      nock('https://api.hubapi.com/crm/v3/objects/tickets')
      .get(url => url.includes("associations=Contact&associations=Company&limit=1&after=180209481&properties=content%2Csubject%2Ccreateddate%2Chs_pipeline%2Chs_pipeline_stage%2Chs_ticket_priority%2Clast_reply_date%2Csource_type%2Chubspot_owner_id"))
        .reply(401)
      try {
        await getPagedTickets({
          connectorAuthorization: 'Bearer connectorAuthorizationValue',
          apiBaseUrl: 'https://api.hubapi.com',
          mfJwt: { email: 'srini.gargeya@vmware.com' }
        }, 'https://api.hubapi.com/crm/v3/objects/tickets?associations=Contact&associations=Company&limit=1&after=180209481&properties=content%2Csubject%2Ccreateddate%2Chs_pipeline%2Chs_pipeline_stage%2Chs_ticket_priority%2Clast_reply_date%2Csource_type%2Chubspot_owner_id' )
        sinon.assert.fail('getMyOpenCases should throw exception. so this path should not be reachable')
      } catch (err) {
        const error = JSON.parse(err.message)
        expect(error.statusCode).to.equal(401)
      }
    })
  })

  describe('getTicketStagesMap', () => {
    it('getTicketStagesMap happy path', async () => {
      nock('https://api.hubapi.com')
        .get('/crm-pipelines/v1/pipelines/tickets')
        .reply(200, ticketStagesOutput)
      const response = await getTicketStagesMap({
        connectorAuthorization: 'Bearer connectorAuthorizationValue',
        apiBaseUrl: 'https://api.hubapi.com',
        mfJwt: { email: 'srini.gargeya@vmware.com' }
      })
      expect(typeof response).to.equal('object')
    })

    it('getTicketStagesMap in network error', async () => {
      nock('https://api.hubapi.com')
        .get('/crm-pipelines/v1/pipelines/tickets')
        .reply(401)
      try {
        await getTicketStagesMap({
          connectorAuthorization: 'Bearer connectorAuthorizationValue',
          apiBaseUrl: 'https://api.hubapi.com',
          mfJwt: { email: 'srini.gargeya@vmware.com' }
        })
        sinon.assert.fail('actionsOnCase should throw exception. so this path should not be reachable')
      } catch (err) {
        const error = JSON.parse(err.message)
        expect(error.statusCode).to.equal(401)
      }
    })
  }) 

  describe('getContactNamesOfTicket', () => {
    it('getContactNamesOfTicket happy path', async () => {
      nock('https://api.hubapi.com')
        .get('/contacts/v1/contact/vids/batch')
        .query(true)
        .reply(200, contactInfo)
      const response = await getContactNamesOfTicket({
        connectorAuthorization: 'Bearer connectorAuthorizationValue',
        apiBaseUrl: 'https://api.hubapi.com',
        mfJwt: { email: 'srini.gargeya@vmware.com' }
      },[51,151])
      expect(typeof response).to.equal('object')
    })

    it('getContactNamesOfDeal in network error', async () => {
      nock('https://api.hubapi.com')
      .get('/contacts/v1/contact/vids/batch')
      .query(true)
      .reply(401)
      try { await getContactNamesOfTicket({
          connectorAuthorization: 'Bearer connectorAuthorizationValue',
          apiBaseUrl: 'https://api.hubapi.com',
          mfJwt: { email: 'srini.gargeya@vmware.com' }
        }, [51,151])
      } catch (err) {
        const error = JSON.parse(err.message)
        expect(error.statusCode).to.equal(401)
      }   
    })
  })

  describe('getCompanyInfoFromId', () => {
    it('getCompanyInfoFromId happy path', async () => {
      nock('https://api.hubapi.com')
        .get(url => url.includes('/companies/v2/companies/'))
        .reply(200, companyInfo)
      const response = await getCompanyInfoFromId({
        connectorAuthorization: 'Bearer connectorAuthorizationValue',
        apiBaseUrl: 'https://api.hubapi.com',
        mfJwt: { email: 'srini.gargeya@vmware.com' }
      }, 4294592507)
      expect(typeof response).to.equal('string')
    })

    it('getCompanyInfoFromId in network error handle', async () => {
      nock('https://api.hubapi.com')
      .get(url => url.includes('/companies/v2/companies/'))
      .reply(401)
      try {
        await getCompanyInfoFromId({
          connectorAuthorization: 'Bearer connectorAuthorizationValue',
          apiBaseUrl: 'https://api.hubapi.com',
          mfJwt: { email: 'srini.gargeya@vmware.com' }
        }, 4294592507)
      } catch (err) {
        const error = JSON.parse(err.message)
        expect(error.statusCode).to.equal(401)
        }      
    })
})

describe('performActionOnTicket', () => {
  it('performActionOnTicket happy path', async () => {
    nock('https://api.hubapi.com')
      .post('/engagements/v1/engagements',{
        "associations": {
          "ownerIds": [],
          "companyIds": [],
          "contactIds": [],
          "dealIds": [],
          "ticketIds": [
            175689413
          ],
          "engagementsV2UniversalAssociations": {}
        },
        "engagement": {
          "source": "CRM_UI",
          "sourceId": "kumar@backflipt.com",
          "type": "NOTE",
          "timestamp": 12345,
          "ownerId": 50035835
        },
        "metadata": {
          "body": `<p>test comment</p>`
        },
        "attachments": [],
        "scheduledTasks": [],
        "inviteeEmails": []
      })
      .reply(200,statusInfo)
    const response = await performActionOnTicket({
      connectorAuthorization: 'Bearer connectorAuthorizationValue',
      apiBaseUrl: 'https://api.hubapi.com',
      mfJwt: { email: 'srini.gargeya@vmware.com' }
    }, 175689413, 50035835, 'kumar@backflipt.com','test comment','NOTE',12345)
    expect(response).to.equal(200)
  })

  it('performActionOnTicket in network error handle', async () => {
    nock('https://api.hubapi.com')
    .post('/engagements/v1/engagements',{
      "associations": {
        "ownerIds": [],
        "companyIds": [],
        "contactIds": [],
        "dealIds": [],
        "ticketIds": [
          2776312614
        ],
        "engagementsV2UniversalAssociations": {}
      },
      "engagement": {
        "source": "CRM_UI",
        "sourceId": "kumar@backflipt.com",
        "type": "NOTE",
        "timestamp": 12345,
        "ownerId": 50035835
      },
      "metadata": {
        "body": `<p>test comment</p>`
      },
      "attachments": [],
      "scheduledTasks": [],
      "inviteeEmails": []
    })
    .reply(401)
    try {
      await performActionOnTicket({
        connectorAuthorization: 'Bearer connectorAuthorizationValue',
        apiBaseUrl: 'https://api.hubapi.com',
        mfJwt: { email: 'srini.gargeya@vmware.com' }
      }, 2776312614,50035835,'kumar@backflipt.com','test comment','NOTE',12345)
    } catch (err) {
      const error = JSON.parse(err.message)
      expect(error.statusCode).to.equal(401)
      }
  })
})

describe('updateTicketStatus', () => {
  it('updateTicketStatus happy path', async () => {
    nock('https://api.hubapi.com')
      .patch('/crm/v3/objects/tickets/175689413',{
        "properties": {
        "hs_pipeline_stage" : '0'
        }
      })
      .reply(200,statusInfo)
    const response = await updateTicketStatus({
      connectorAuthorization: 'Bearer connectorAuthorizationValue',
      apiBaseUrl: 'https://api.hubapi.com',
      mfJwt: { email: 'srini.gargeya@vmware.com' }
    }, 175689413, '0')
    expect(response).to.equal(200)
  })

  it('updateTicketStatus in network error handle', async () => {
    nock('https://api.hubapi.com')
    .patch('/crm/v3/objects/tickets/175689413',{
      "properties": {
      "hs_pipeline_stage" : '0'
      }
    })
    .reply(401)
    try {
      await updateTicketStatus({
        connectorAuthorization: 'Bearer connectorAuthorizationValue',
        apiBaseUrl: 'https://api.hubapi.com',
        mfJwt: { email: 'srini.gargeya@vmware.com' }
      }, 175689413, '0')
    } catch (err) {
      const error = JSON.parse(err.message)
      expect(error.statusCode).to.equal(401)
      }
  })
})
})

const userInfoMockResp = {
  "token": "CPP55ui_LhIDAQEBGOqz9wMg0OTEBSjS6Q0yGQCb8pDWHiWNQdQIidEHjkVrmPOMoOoIBE06GgAKAkEAAAyAwgcIAAAAAQAAAAAAAAAYwAAfQhkAm_KQ1u4skUNi1LnTg9HoQhBucVVmiEqs",
  "user": "kumar@backflipt.com",
  "hub_domain": "backflipt.com",
  "scopes": [
    "contacts",
    "oauth",
    "tickets"
  ],
  "scope_to_scope_group_pks": [
    10,
    12,
    18,
    25,
    31,
    51,
    52,
    64,
    66,
    71,
    72,
    73,
    74,
    75,
    84,
    113,
    180,
    181,
    191,
    192,
    201,
    202,
    203,
    204,
    205
  ],
  "hub_id": 8247786,
  "app_id": 226514,
  "expires_in": 19565,
  "user_id": 11612752,
  "token_type": "access"
}

const ownersList = {
  "results": [
    {
      "id": "50035835",
      "email": "kumar@backflipt.com",
      "firstName": "Kumar",
      "lastName": "Gargeya",
      "userId": 11612752,
      "createdAt": "2020-08-10T05:14:01.866Z",
      "updatedAt": "2020-08-10T05:53:10.388Z",
      "archived": false
    },
    {
      "id": "50040786",
      "email": "hemanthkethe@backflipt.com",
      "firstName": "Hemanth",
      "lastName": "Kethe",
      "userId": 11615255,
      "createdAt": "2020-08-10T11:40:53.119Z",
      "updatedAt": "2020-08-10T11:44:32.587Z",
      "archived": false
    },
    {
      "id": "50103167",
      "email": "pavan@backflipt.com",
      "firstName": "Pavan",
      "lastName": "Babu",
      "userId": 11636978,
      "createdAt": "2020-08-12T09:18:31.180Z",
      "updatedAt": "2020-08-12T09:25:15.304Z",
      "archived": false
    },
    {
      "id": "50103219",
      "email": "sravani@backflipt.com",
      "firstName": "Sravani",
      "lastName": "Bhagavathula",
      "userId": 11636981,
      "createdAt": "2020-08-12T09:18:54.677Z",
      "updatedAt": "2020-08-12T09:26:03.171Z",
      "archived": false
    },
    {
      "id": "50103664",
      "email": "dolly@backflipt.com",
      "firstName": "dolly",
      "lastName": "karedi",
      "userId": 11637456,
      "createdAt": "2020-08-12T10:26:50.270Z",
      "updatedAt": "2020-08-12T10:29:44.898Z",
      "archived": false
    },
    {
      "id": "50103864",
      "email": "shankavaram@backflipt.com",
      "firstName": "Srinivas",
      "lastName": "Shankavaram",
      "userId": 11637494,
      "createdAt": "2020-08-12T10:32:29.383Z",
      "updatedAt": "2020-08-12T10:33:18.218Z",
      "archived": false
    },
    {
      "id": "50137194",
      "email": "srini@backflipt.com",
      "firstName": "Srini",
      "lastName": "Gargeya",
      "userId": 4490908,
      "createdAt": "2020-08-13T16:17:01.353Z",
      "updatedAt": "2020-08-13T16:27:01.595Z",
      "archived": false
    }
  ]
}

const activeTicketsWithOutPagination = {
  "results": [
    {
      "id": "175689413",
      "properties": {
        "content": "Product installation issue - IOS",
        "createdate": "2020-08-10T05:28:58.407Z",
        "hs_lastmodifieddate": "2020-08-17T10:16:25.268Z",
        "hs_object_id": "175689413",
        "hs_pipeline": "0",
        "hs_pipeline_stage": "4",
        "hs_ticket_priority": "LOW",
        "hubspot_owner_id": "50035835",
        "last_reply_date": null,
        "source_type": "PHONE",
        "subject": "Product installation issue"
      },
      "createdAt": "2020-08-10T05:28:58.407Z",
      "updatedAt": "2020-08-17T10:16:25.268Z",
      "associations": {
        "contacts": {
          "results": [
            {
              "id": "101",
              "type": "ticket_to_contact"
            }
          ]
        },
        "companies": {
          "results": [
            {
              "id": "4294592507",
              "type": "ticket_to_company"
            }
          ]
        }
      },
      "archived": false
    }
  ]
}

const statusInfo ={
  'status':200
}

const ticketStagesOutput = {
  "results": [
    {
      "label": "Support Pipeline",
      "displayOrder": 0,
      "active": true,
      "stages": [
        {
          "label": "New",
          "displayOrder": 0,
          "metadata": {
            "ticketState": "OPEN",
            "isClosed": "false"
          },
          "stageId": "1",
          "createdAt": 0,
          "updatedAt": null,
          "active": true
        },
        {
          "label": "Closed",
          "displayOrder": 3,
          "metadata": {
            "ticketState": "CLOSED",
            "isClosed": "true"
          },
          "stageId": "4",
          "createdAt": 0,
          "updatedAt": null,
          "active": true
        },
        {
          "label": "Waiting on contact",
          "displayOrder": 1,
          "metadata": {
            "ticketState": "OPEN",
            "isClosed": "false"
          },
          "stageId": "2",
          "createdAt": 0,
          "updatedAt": null,
          "active": true
        },
        {
          "label": "Waiting on us",
          "displayOrder": 2,
          "metadata": {
            "ticketState": "OPEN",
            "isClosed": "false"
          },
          "stageId": "3",
          "createdAt": 0,
          "updatedAt": null,
          "active": true
        }
      ],
      "objectType": "TICKET",
      "objectTypeId": "0-5",
      "pipelineId": "0",
      "createdAt": 0,
      "updatedAt": null,
      "default": true
    }
  ]
}

const companyInfo = {
  "portalId": 8247786,
  "companyId": 4294592507,
  "isDeleted": false,
  "properties": {
    "country": {
      "value": "United States",
      "timestamp": 1597036440201,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "country",
          "value": "United States",
          "timestamp": 1597036440201,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "city": {
      "value": "Cambridge",
      "timestamp": 1597036440201,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "city",
          "value": "Cambridge",
          "timestamp": 1597036440201,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "num_associated_contacts": {
      "value": "2",
      "timestamp": 1597036442920,
      "source": "CALCULATED",
      "sourceId": "RollupProperties",
      "versions": [
        {
          "name": "num_associated_contacts",
          "value": "2",
          "timestamp": 1597036442920,
          "sourceId": "RollupProperties",
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "timezone": {
      "value": "America/New_York",
      "timestamp": 1597036440201,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "timezone",
          "value": "America/New_York",
          "timestamp": 1597036440201,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "facebook_company_page": {
      "value": "https://www.facebook.com/hubspot",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "facebook_company_page",
          "value": "https://www.facebook.com/hubspot",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "createdate": {
      "value": "1597036439975",
      "timestamp": 1597036439975,
      "source": "COMPANIES",
      "sourceId": "FetchAssociatedCompanyIdStep",
      "versions": [
        {
          "name": "createdate",
          "value": "1597036439975",
          "timestamp": 1597036439975,
          "sourceId": "FetchAssociatedCompanyIdStep",
          "source": "COMPANIES",
          "sourceVid": []
        }
      ]
    },
    "description": {
      "value": "HubSpot is an American developer and marketer of software products for inbound marketing, sales, and customer service.",
      "timestamp": 1597036440201,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "description",
          "value": "HubSpot is an American developer and marketer of software products for inbound marketing, sales, and customer service.",
          "timestamp": 1597036440201,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "hs_num_blockers": {
      "value": "0",
      "timestamp": 1597036441226,
      "source": "SALES",
      "sourceId": "AssociationsPropertyWorker",
      "versions": [
        {
          "name": "hs_num_blockers",
          "value": "0",
          "timestamp": 1597036441226,
          "sourceId": "AssociationsPropertyWorker",
          "source": "SALES",
          "sourceVid": []
        }
      ]
    },
    "industry": {
      "value": "COMPUTER_SOFTWARE",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "industry",
          "value": "COMPUTER_SOFTWARE",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "total_money_raised": {
      "value": "100.5M",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "total_money_raised",
          "value": "100.5M",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "web_technologies": {
      "value": "unbounce;facebook_advertiser;salesforce;app_nexus;cloud_flare;piwik;dstillery;google_analytics;twitter_button;hubspot;vidyard;sentry;google_tag_manager;facebook_connect;crazy_egg;amazon__cloudfront;wistia;optimizely",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "web_technologies",
          "value": "unbounce;facebook_advertiser;salesforce;app_nexus;cloud_flare;piwik;dstillery;google_analytics;twitter_button;hubspot;vidyard;sentry;google_tag_manager;facebook_connect;crazy_egg;amazon__cloudfront;wistia;optimizely",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "hs_total_deal_value": {
      "value": "1200.0",
      "timestamp": 1597049601469,
      "source": "SALES",
      "sourceId": "AssociationsPropertyWorker",
      "versions": [
        {
          "name": "hs_total_deal_value",
          "value": "1200.0",
          "timestamp": 1597049601469,
          "sourceId": "AssociationsPropertyWorker",
          "source": "SALES",
          "sourceVid": []
        }
      ]
    },
    "numberofemployees": {
      "value": "5000",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "numberofemployees",
          "value": "5000",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "hs_analytics_num_visits": {
      "value": "0",
      "timestamp": 1597036442756,
      "source": "CALCULATED",
      "sourceId": "company sync triggered by vid=1",
      "versions": [
        {
          "name": "hs_analytics_num_visits",
          "value": "0",
          "timestamp": 1597036442756,
          "sourceId": "company sync triggered by vid=1",
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "linkedin_company_page": {
      "value": "https://www.linkedin.com/company/hubspot",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "linkedin_company_page",
          "value": "https://www.linkedin.com/company/hubspot",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "first_deal_created_date": {
      "value": "1597049547389",
      "timestamp": 1597049601588,
      "source": "DEALS",
      "sourceId": "DealRollupProperties",
      "versions": [
        {
          "name": "first_deal_created_date",
          "value": "1597049547389",
          "timestamp": 1597049601588,
          "sourceId": "DealRollupProperties",
          "source": "DEALS",
          "sourceVid": []
        }
      ]
    },
    "hs_analytics_source": {
      "value": "OFFLINE",
      "timestamp": 1597036442756,
      "source": "CALCULATED",
      "sourceId": "company sync triggered by vid=1",
      "versions": [
        {
          "name": "hs_analytics_source",
          "value": "OFFLINE",
          "timestamp": 1597036442756,
          "sourceId": "company sync triggered by vid=1",
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "num_contacted_notes": {
      "value": "3",
      "timestamp": 1597052888565,
      "source": "ENGAGEMENTS",
      "sourceId": "ObjectPropertyUpdater",
      "versions": [
        {
          "name": "num_contacted_notes",
          "value": "3",
          "timestamp": 1597052888565,
          "sourceId": "ObjectPropertyUpdater",
          "source": "ENGAGEMENTS",
          "sourceVid": []
        }
      ]
    },
    "annualrevenue": {
      "value": "250000000",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "annualrevenue",
          "value": "250000000",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "founded_year": {
      "value": "2006",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "founded_year",
          "value": "2006",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "num_associated_deals": {
      "value": "1",
      "timestamp": 1597049601588,
      "source": "DEALS",
      "sourceId": "DealRollupProperties",
      "versions": [
        {
          "name": "num_associated_deals",
          "value": "1",
          "timestamp": 1597049601588,
          "sourceId": "DealRollupProperties",
          "source": "DEALS",
          "sourceVid": []
        }
      ]
    },
    "hs_analytics_num_page_views": {
      "value": "0",
      "timestamp": 1597036442756,
      "source": "CALCULATED",
      "sourceId": "company sync triggered by vid=1",
      "versions": [
        {
          "name": "hs_analytics_num_page_views",
          "value": "0",
          "timestamp": 1597036442756,
          "sourceId": "company sync triggered by vid=1",
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "state": {
      "value": "MA",
      "timestamp": 1597036440201,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "state",
          "value": "MA",
          "timestamp": 1597036440201,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "linkedinbio": {
      "value": "HubSpot is an American developer and marketer of software products for inbound marketing, sales, and customer service.",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "linkedinbio",
          "value": "HubSpot is an American developer and marketer of software products for inbound marketing, sales, and customer service.",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "hs_num_open_deals": {
      "value": "1",
      "timestamp": 1597049601469,
      "source": "SALES",
      "sourceId": "AssociationsPropertyWorker",
      "versions": [
        {
          "name": "hs_num_open_deals",
          "value": "1",
          "timestamp": 1597049601469,
          "sourceId": "AssociationsPropertyWorker",
          "source": "SALES",
          "sourceVid": []
        }
      ]
    },
    "zip": {
      "value": "02141",
      "timestamp": 1597036440201,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "zip",
          "value": "02141",
          "timestamp": 1597036440201,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "notes_last_updated": {
      "value": "1597051989917",
      "timestamp": 1597052065685,
      "source": "ENGAGEMENTS",
      "sourceId": "ObjectPropertyUpdater",
      "versions": [
        {
          "name": "notes_last_updated",
          "value": "1597051989917",
          "timestamp": 1597052065685,
          "sourceId": "ObjectPropertyUpdater",
          "source": "ENGAGEMENTS",
          "sourceVid": []
        }
      ]
    },
    "website": {
      "value": "hubspot.com",
      "timestamp": 1597036439975,
      "source": "COMPANIES",
      "sourceId": "FetchAssociatedCompanyIdStep",
      "versions": [
        {
          "name": "website",
          "value": "hubspot.com",
          "timestamp": 1597036439975,
          "sourceId": "FetchAssociatedCompanyIdStep",
          "source": "COMPANIES",
          "sourceVid": []
        }
      ]
    },
    "address": {
      "value": "25 First Street",
      "timestamp": 1597036440201,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "address",
          "value": "25 First Street",
          "timestamp": 1597036440201,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "hs_analytics_first_timestamp": {
      "value": "1597036439544",
      "timestamp": 1597036442756,
      "source": "CALCULATED",
      "sourceId": "company sync triggered by vid=1",
      "versions": [
        {
          "name": "hs_analytics_first_timestamp",
          "value": "1597036439544",
          "timestamp": 1597036442756,
          "sourceId": "company sync triggered by vid=1",
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "first_contact_createdate": {
      "value": "1597036439544",
      "timestamp": 1597036441158,
      "source": "CALCULATED",
      "sourceId": "company sync triggered by vid=1",
      "versions": [
        {
          "name": "first_contact_createdate",
          "value": "1597036439544",
          "timestamp": 1597036441158,
          "sourceId": "company sync triggered by vid=1",
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "twitterhandle": {
      "value": "HubSpot",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "twitterhandle",
          "value": "HubSpot",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "hs_target_account_probability": {
      "value": "0.6736696362495422",
      "timestamp": 1597052067699,
      "source": "SALES",
      "sourceId": null,
      "versions": [
        {
          "name": "hs_target_account_probability",
          "value": "0.6736696362495422",
          "timestamp": 1597052067699,
          "source": "SALES",
          "sourceVid": []
        }
      ]
    },
    "hs_lastmodifieddate": {
      "value": "1597052888859",
      "timestamp": 1597052888859,
      "source": "CALCULATED",
      "sourceId": null,
      "versions": [
        {
          "name": "hs_lastmodifieddate",
          "value": "1597052888859",
          "timestamp": 1597052888859,
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "hs_num_decision_makers": {
      "value": "0",
      "timestamp": 1597036441226,
      "source": "SALES",
      "sourceId": "AssociationsPropertyWorker",
      "versions": [
        {
          "name": "hs_num_decision_makers",
          "value": "0",
          "timestamp": 1597036441226,
          "sourceId": "AssociationsPropertyWorker",
          "source": "SALES",
          "sourceVid": []
        }
      ]
    },
    "notes_last_contacted": {
      "value": "1597051989917",
      "timestamp": 1597052065685,
      "source": "ENGAGEMENTS",
      "sourceId": "ObjectPropertyUpdater",
      "versions": [
        {
          "name": "notes_last_contacted",
          "value": "1597051989917",
          "timestamp": 1597052065685,
          "sourceId": "ObjectPropertyUpdater",
          "source": "ENGAGEMENTS",
          "sourceVid": []
        }
      ]
    },
    "phone": {
      "value": "+1 888-482-7768",
      "timestamp": 1597036440201,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "phone",
          "value": "+1 888-482-7768",
          "timestamp": 1597036440201,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "domain": {
      "value": "hubspot.com",
      "timestamp": 1597036439975,
      "source": "COMPANIES",
      "sourceId": "FetchAssociatedCompanyIdStep",
      "versions": [
        {
          "name": "domain",
          "value": "hubspot.com",
          "timestamp": 1597036439975,
          "sourceId": "FetchAssociatedCompanyIdStep",
          "source": "COMPANIES",
          "sourceVid": []
        }
      ]
    },
    "hs_num_child_companies": {
      "value": "0",
      "timestamp": 1597036442919,
      "source": "CALCULATED",
      "sourceId": "RollupProperties",
      "versions": [
        {
          "name": "hs_num_child_companies",
          "value": "0",
          "timestamp": 1597036442919,
          "sourceId": "RollupProperties",
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "hs_num_contacts_with_buying_roles": {
      "value": "0",
      "timestamp": 1597036441226,
      "source": "SALES",
      "sourceId": "AssociationsPropertyWorker",
      "versions": [
        {
          "name": "hs_num_contacts_with_buying_roles",
          "value": "0",
          "timestamp": 1597036441226,
          "sourceId": "AssociationsPropertyWorker",
          "source": "SALES",
          "sourceVid": []
        }
      ]
    },
    "hs_object_id": {
      "value": "4294592507",
      "timestamp": 1597036439975,
      "source": "COMPANIES",
      "sourceId": "FetchAssociatedCompanyIdStep",
      "versions": [
        {
          "name": "hs_object_id",
          "value": "4294592507",
          "timestamp": 1597036439975,
          "sourceId": "FetchAssociatedCompanyIdStep",
          "source": "COMPANIES",
          "sourceVid": []
        }
      ]
    },
    "is_public": {
      "value": "true",
      "timestamp": 1597036440202,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "is_public",
          "value": "true",
          "timestamp": 1597036440202,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "name": {
      "value": "HubSpot, Inc.",
      "timestamp": 1597036440201,
      "source": "BIDEN",
      "sourceId": "BidenPropertyMappings",
      "versions": [
        {
          "name": "name",
          "value": "HubSpot, Inc.",
          "timestamp": 1597036440201,
          "sourceId": "BidenPropertyMappings",
          "source": "BIDEN",
          "sourceVid": []
        }
      ]
    },
    "hs_last_logged_call_date": {
      "value": "1597051989917",
      "timestamp": 1597052065381,
      "source": "SALES",
      "sourceId": "AssociationsPropertyWorker",
      "versions": [
        {
          "name": "hs_last_logged_call_date",
          "value": "1597051989917",
          "timestamp": 1597052065381,
          "sourceId": "AssociationsPropertyWorker",
          "source": "SALES",
          "sourceVid": []
        }
      ]
    },
    "hs_analytics_source_data_2": {
      "value": "sample-contact",
      "timestamp": 1597036442756,
      "source": "CALCULATED",
      "sourceId": "company sync triggered by vid=1",
      "versions": [
        {
          "name": "hs_analytics_source_data_2",
          "value": "sample-contact",
          "timestamp": 1597036442756,
          "sourceId": "company sync triggered by vid=1",
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "hs_analytics_source_data_1": {
      "value": "API",
      "timestamp": 1597036442756,
      "source": "CALCULATED",
      "sourceId": "company sync triggered by vid=1",
      "versions": [
        {
          "name": "hs_analytics_source_data_1",
          "value": "API",
          "timestamp": 1597036442756,
          "sourceId": "company sync triggered by vid=1",
          "source": "CALCULATED",
          "sourceVid": []
        }
      ]
    },
    "lifecyclestage": {
      "value": "opportunity",
      "timestamp": 1597049601576,
      "source": "DEALS",
      "sourceId": "deals-lifecycle-sync",
      "versions": [
        {
          "name": "lifecyclestage",
          "value": "opportunity",
          "timestamp": 1597049601576,
          "sourceId": "deals-lifecycle-sync",
          "source": "DEALS",
          "sourceVid": []
        }
      ]
    },
    "num_notes": {
      "value": "3",
      "timestamp": 1597052888565,
      "source": "ENGAGEMENTS",
      "sourceId": "ObjectPropertyUpdater",
      "versions": [
        {
          "name": "num_notes",
          "value": "3",
          "timestamp": 1597052888565,
          "sourceId": "ObjectPropertyUpdater",
          "source": "ENGAGEMENTS",
          "sourceVid": []
        }
      ]
    }
  },
  "additionalDomains": [],
  "stateChanges": [],
  "mergeAudits": []
}

const contactInfo = {
  "51": {
    "vid": 51,
    "canonical-vid": 51,
    "merged-vids": [],
    "portal-id": 8247786,
    "is-contact": true,
    "profile-token": "AO_T-mObfdnPNi4g4Z4rW02E3x4onRU6hSqp5v74Kww2ojG0W-CXMFrDxIXenohBZ5peQsMYzAEb0bQHLGyzn9LixT8MHA7HQtt1VMqsepQVGkbSC1vAS_w7Txoc8LOvf0K2SPZWtP0Q",
    "profile-url": "https://app.hubspot.com/contacts/8247786/contact/51",
    "properties": {
      "firstname": {
        "value": "Brian"
      },
      "associatedcompanyid": {
        "value": "4294592507"
      },
      "lastmodifieddate": {
        "value": "1597052179122"
      },
      "lastname": {
        "value": "Halligan (Sample Contact)"
      }
    },
    "form-submissions": [],
    "identity-profiles": [
      {
        "vid": 51,
        "saved-at-timestamp": 1597036439978,
        "deleted-changed-timestamp": 0,
        "identities": [
          {
            "type": "EMAIL",
            "value": "bh@hubspot.com",
            "timestamp": 1597036439544,
            "is-primary": true
          },
          {
            "type": "LEAD_GUID",
            "value": "ca13fbc9-25e1-4837-be8c-3f3273f9c2cf",
            "timestamp": 1597036439973
          }
        ]
      }
    ],
    "merge-audits": [],
    "associated-company": {
      "company-id": 4294592507,
      "portal-id": 8247786,
      "properties": {
        "country": {
          "value": "United States"
        },
        "num_associated_contacts": {
          "value": "2"
        },
        "city": {
          "value": "Cambridge"
        },
        "timezone": {
          "value": "America/New_York"
        },
        "facebook_company_page": {
          "value": "https://www.facebook.com/hubspot"
        },
        "description": {
          "value": "HubSpot is an American developer and marketer of software products for inbound marketing, sales, and customer service."
        },
        "createdate": {
          "value": "1597036439975"
        },
        "web_technologies": {
          "value": "unbounce;facebook_advertiser;salesforce;app_nexus;cloud_flare;piwik;dstillery;google_analytics;twitter_button;hubspot;vidyard;sentry;google_tag_manager;facebook_connect;crazy_egg;amazon__cloudfront;wistia;optimizely"
        },
        "total_money_raised": {
          "value": "100.5M"
        },
        "industry": {
          "value": "COMPUTER_SOFTWARE"
        },
        "hs_num_blockers": {
          "value": "0"
        },
        "numberofemployees": {
          "value": "5000"
        },
        "hs_total_deal_value": {
          "value": "1200.0"
        },
        "hs_analytics_num_visits": {
          "value": "0"
        },
        "linkedin_company_page": {
          "value": "https://www.linkedin.com/company/hubspot"
        },
        "num_contacted_notes": {
          "value": "3"
        },
        "hs_analytics_source": {
          "value": "OFFLINE"
        },
        "first_deal_created_date": {
          "value": "1597049547389"
        },
        "annualrevenue": {
          "value": "250000000"
        },
        "founded_year": {
          "value": "2006"
        },
        "num_associated_deals": {
          "value": "1"
        },
        "hs_analytics_num_page_views": {
          "value": "0"
        },
        "state": {
          "value": "MA"
        },
        "linkedinbio": {
          "value": "HubSpot is an American developer and marketer of software products for inbound marketing, sales, and customer service."
        },
        "zip": {
          "value": "02141"
        },
        "hs_num_open_deals": {
          "value": "1"
        },
        "notes_last_updated": {
          "value": "1597051989917"
        },
        "website": {
          "value": "hubspot.com"
        },
        "address": {
          "value": "25 First Street"
        },
        "hs_analytics_first_timestamp": {
          "value": "1597036439544"
        },
        "twitterhandle": {
          "value": "HubSpot"
        },
        "first_contact_createdate": {
          "value": "1597036439544"
        },
        "hs_target_account_probability": {
          "value": "0.6736696362495422"
        },
        "hs_lastmodifieddate": {
          "value": "1597052888859"
        },
        "phone": {
          "value": "+1 888-482-7768"
        },
        "notes_last_contacted": {
          "value": "1597051989917"
        },
        "hs_num_decision_makers": {
          "value": "0"
        },
        "domain": {
          "value": "hubspot.com"
        },
        "name": {
          "value": "HubSpot, Inc."
        },
        "is_public": {
          "value": "true"
        },
        "hs_object_id": {
          "value": "4294592507"
        },
        "hs_num_contacts_with_buying_roles": {
          "value": "0"
        },
        "hs_num_child_companies": {
          "value": "0"
        },
        "hs_last_logged_call_date": {
          "value": "1597051989917"
        },
        "hs_analytics_source_data_2": {
          "value": "sample-contact"
        },
        "hs_analytics_source_data_1": {
          "value": "API"
        },
        "lifecyclestage": {
          "value": "opportunity"
        },
        "num_notes": {
          "value": "3"
        }
      }
    }
  },
  "151": {
    "vid": 151,
    "canonical-vid": 151,
    "merged-vids": [],
    "portal-id": 8247786,
    "is-contact": true,
    "profile-token": "AO_T-mOAp2Dqot6LpbB5dkz4Q4kz4A-8bflNSVzhCU2VRHT1LVdpMe0pQ4yx2oJhcrfi9VPwuegE_hH0Tz3DZwGa3ZozAi6IPqbXTD515m2QPqln-KGyQ9R56we0J2j-Yh5q8wnvvvGz",
    "profile-url": "https://app.hubspot.com/contacts/8247786/contact/151",
    "properties": {
      "associatedcompanyid": {
        "value": "4316875486"
      },
      "phone": {
        "value": "555-444-1122"
      },
      "email": {
        "value": "pete@cdk.com"
      }
    },
    "form-submissions": [],
    "identity-profiles": [
      {
        "vid": 151,
        "saved-at-timestamp": 1597336347634,
        "deleted-changed-timestamp": 0,
        "identities": [
          {
            "type": "EMAIL",
            "value": "pete@cdk.com",
            "timestamp": 1597336347576,
            "is-primary": true
          },
          {
            "type": "LEAD_GUID",
            "value": "564235aa-48b8-4ab0-8a6d-4e60bb179c16",
            "timestamp": 1597336347629
          }
        ]
      }
    ],
    "merge-audits": [],
    "associated-company": {
      "company-id": 4316875486,
      "portal-id": 8247786,
      "properties": {
        "country": {
          "value": "United States"
        },
        "num_associated_contacts": {
          "value": "1"
        },
        "city": {
          "value": "Hoffman Estates"
        },
        "timezone": {
          "value": "America/Chicago"
        },
        "facebook_company_page": {
          "value": "https://facebook.com/cdkglobal"
        },
        "description": {
          "value": "CDK Global provides auto dealer software as well as solutions for truck, motorcycle, marine and RV dealers throughout North America and beyond."
        },
        "createdate": {
          "value": "1597336347243"
        },
        "web_technologies": {
          "value": "youtube;new_relic;qualtrics;pardot;nginx;drupal;google_tag_manager;add_to_any;google_analytics;cloud_flare"
        },
        "industry": {
          "value": "COMPUTER_SOFTWARE"
        },
        "hs_num_blockers": {
          "value": "0"
        },
        "numberofemployees": {
          "value": "10000"
        },
        "hs_total_deal_value": {
          "value": "100000.0"
        },
        "hs_analytics_num_visits": {
          "value": "0"
        },
        "linkedin_company_page": {
          "value": "https://www.linkedin.com/company/cdkglobal"
        },
        "hs_analytics_source": {
          "value": "OFFLINE"
        },
        "first_deal_created_date": {
          "value": "1597348961368"
        },
        "annualrevenue": {
          "value": "250000000"
        },
        "founded_year": {
          "value": "1972"
        },
        "num_associated_deals": {
          "value": "1"
        },
        "hs_analytics_num_page_views": {
          "value": "0"
        },
        "state": {
          "value": "IL"
        },
        "linkedinbio": {
          "value": "CDK Global provides auto dealer software as well as solutions for truck, motorcycle, marine and RV dealers throughout North America and beyond."
        },
        "zip": {
          "value": "60169"
        },
        "hs_num_open_deals": {
          "value": "1"
        },
        "website": {
          "value": "cdk.com"
        },
        "address": {
          "value": "1950 Hassell Road"
        },
        "hs_analytics_first_timestamp": {
          "value": "1597336347432"
        },
        "twitterhandle": {
          "value": "CDKGlobal"
        },
        "first_contact_createdate": {
          "value": "1597336347576"
        },
        "hs_target_account_probability": {
          "value": "0.46257445216178894"
        },
        "hs_lastmodifieddate": {
          "value": "1597349050694"
        },
        "phone": {
          "value": "+1 847-397-1700"
        },
        "hs_num_decision_makers": {
          "value": "0"
        },
        "domain": {
          "value": "cdk.com"
        },
        "name": {
          "value": "CDK Global"
        },
        "is_public": {
          "value": "true"
        },
        "hs_object_id": {
          "value": "4316875486"
        },
        "hs_num_contacts_with_buying_roles": {
          "value": "0"
        },
        "hs_num_child_companies": {
          "value": "0"
        },
        "hs_analytics_source_data_2": {
          "value": "CRM_UI"
        },
        "hs_analytics_source_data_1": {
          "value": "CONTACTS"
        },
        "lifecyclestage": {
          "value": "opportunity"
        }
      }
    }
  }
}

