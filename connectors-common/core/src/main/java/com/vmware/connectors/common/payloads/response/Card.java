/*
 * Copyright © 2019 VMware, Inc. All Rights Reserved.
 * SPDX-License-Identifier: BSD-2-Clause
 */

package com.vmware.connectors.common.payloads.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.vmware.connectors.common.utils.HashUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.CollectionUtils;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_EMPTY;
import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

/**
 * This class represents a single "connector card", a collection of information meant to be displayed to the user of a
 * mobile device to allow them to take actions against that information.
 * <p>
 * The Card class is unmodifiable once created. It cannot be directly constructed; use the Card.Builder class
 * to create and populate a Card instance.
 */
@JsonInclude(NON_NULL)
@SuppressWarnings("PMD.LinguisticNaming")
public class Card {
    @JsonProperty("id")
    private UUID id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("sticky")
    private Sticky sticky;

    @JsonProperty("creation_date")
    private OffsetDateTime creationDate;

    @JsonProperty("expiration_date")
    private OffsetDateTime expirationDate;

    @JsonProperty("due_date")
    private OffsetDateTime dueDate;

    @JsonProperty("importance")
    private Integer importance;

    @JsonProperty("template")
    private Link template;

    @JsonProperty("header")
    private CardHeader header;

    @JsonProperty("banner")
    private CardBanner banner;

    @JsonProperty("body")
    private CardBody body;

    @JsonProperty("actions")
    private final List<CardAction> actions;

    @JsonProperty("image")
    private Link image;

    @JsonProperty("tags")
    private final Set<String> tags;

    @JsonProperty("backend_id")
    private String backendId;

    @JsonProperty("hash")
    private String hash;

    @JsonProperty("links")
    private final List<OpenInLink> links;

    // Don't instantiate directly -- use a Card.Builder
    private Card() {
        this.actions = new ArrayList<>();
        this.id = UUID.randomUUID();
        this.creationDate = OffsetDateTime.now();
        this.tags = new HashSet<>();
        this.links = new ArrayList<>();
    }

    /**
     * Get the Card's id, which allows the client to uniquely identify this Card among all the Cards it may receive
     *
     * @return The Card's id
     */
    public UUID getId() {
        return id;
    }

    /**
     * Get the Card's sticky object.  The notification client can use this to
     * know how long to keep the notification pinned to the top.
     *
     * @return The Card's sticky object
     */
    public Sticky getSticky() {
        return sticky;
    }

    /**
     * Get the Card's creation date .  This could be used to identify creation date of card
     *
     * @return The Card's creation date
     */
    public OffsetDateTime getCreationDate() {
        return creationDate;
    }

    /**
     * Get the Card's expiration date .  This could be used to identify expiration date of card
     *
     * @return The Card's expiration date
     */
    public OffsetDateTime getExpirationDate() {
        return expirationDate;
    }

    /**
     * Get the Card's due date. This could be used to set the due date of the card
     *
     * @return The Card's due date.
     */
    public OffsetDateTime getDueDate() {
        return dueDate;
    }

    /**
     * Get the priority of the card.
     *
     * @return The card importance value.
     */
    public Integer getImportance() {
        return importance;
    }

    /**
     * Get the human-readable name of the card.
     *
     * @return The card's name
     */
    public String getName() {
        return name;
    }

    /**
     * Get a Link representing the location of a template that will be used to render this Card.
     *
     * @return The card's template location
     */
    public Link getTemplate() {
        return template;
    }

    /**
     * Get connector image url link.
     *
     * @return Link for connector image.
     */
    public Link getImage() {
        return image;
    }

    /**
     * Get the header of the card, which can contain a title and a subtitle.
     *
     * @return The card's CardHeader
     */
    public CardHeader getHeader() {
        return header;
    }

    /**
     * Get the banner of the card, which can contain a title, href, etc..
     *
     * @return The card's CardBanner
     */
    public CardBanner getBanner() {
        return banner;
    }

    /**
     * Get the body of the card, which can contain descriptive text, a timestamp, and some number of fields.
     *
     * @return The card's CardBody
     */
    public CardBody getBody() {
        return body;
    }

    /**
     * Return a List containing the actions to be offered by this Card, in the order in which they were added.
     * This List is <i>unmodifiable</i> - its contents cannot be changed once the Card is created.
     * Use Card.Builder.addAction() to populate the Card's bodyFields.
     *
     * @return An unmodifiable List of the actions of this Card
     */
    @JsonInclude(NON_EMPTY)
    public List<CardAction> getActions() {
        return Collections.unmodifiableList(actions);
    }

    /**
     * Returns a List of links to take user to the associated Resources, in the order in which they were added.
     * This List is <i>unmodifiable</i> - its contents cannot be changed once the Card is created.
     * Use Card.Builder.addLinks() to populate the Card's bodyFields.
     *
     * @return An unmodifiable List of the links of this Card
     */
    @JsonInclude(NON_EMPTY)
    public List<OpenInLink> getLinks() {
        return List.copyOf(links);
    }

    /**
     * Return a Set containing the tags applied to this card.
     * The meaning of tags can vary and is known to the connector and consuming clients.
     * This Set is <i>unmodifiable</i> - its contents cannot be changed once the Card is created.
     *
     * @return An unmodifiable Set of the tags on this Card
     */
    @JsonInclude(NON_EMPTY)
    public Set<String> getTags() {
        return Collections.unmodifiableSet(tags);
    }

    /**
     * Return backend id of the card.
     *
     * @return hash value
     */
    @JsonProperty("backend_id")
    public String getBackendId() {
        return this.backendId;
    }

    /**
     * Return the card's hash value.
     *
     * @return hash value
     */
    public String getHash() {
        return this.hash;
    }

    /**
     * This class allows the construction of Card objects. To use, create a Builder instance, call its methods
     * to populate the Card, and call build() to receive the completed Card and reset the builder.
     * <p>
     * A Card can be discarded during creation, returning the Builder to its initial state, by calling reset().
     * The build() method calls reset() internally.
     */
    public static class Builder {

        private Card card;

        /**
         * Create a new Builder instance.
         */
        public Builder() {
            this.card = new Card();
        }

        /**
         * Discard the Card currently under construction and return the Builder to its initial state.
         */
        public void reset() {
            this.card = new Card();
        }

        /**
         * Set the id of the Card under construction.
         *
         * @param uuid the Card's ID
         * @return this Builder instance, for method chaining
         */
        public Builder setId(UUID uuid) {
            card.id = uuid;
            return this;
        }

        /**
         * Set the name of the Card under construction.
         *
         * @param name the Card's name
         * @return this Builder instance, for method chaining
         */
        public Builder setName(String name) {
            card.name = name;
            return this;
        }

        /**
         * Get the sticky object of the Card under construction
         *
         * @param sticky the Card's sticky object
         * @return this Builder instance, for method chaining
         */
        public Builder setSticky(Sticky sticky) {
            card.sticky = sticky;
            return this;
        }

        /**
         * Set the creation date of the Card under construction
         *
         * @param creationDate the Card's creation date, assumed to be an ISO-8601 compliant datetime
         * @return this Builder instance, for method chaining
         */
        public Builder setCreationDate(OffsetDateTime creationDate) {
            card.creationDate = creationDate;
            return this;
        }

        /**
         * Set the importance of the card.
         *
         * @param importance priority of the card.
         * @return this Builder instance, for method chaining
         */
        public Builder setImportance(Integer importance) {
            card.importance = importance;
            return this;
        }

        /**
         * Set the expiration date of the Card under construction
         *
         * @param expirationDate the Card's creation date, assumed to be an ISO-8601 compliant datetime
         * @return this Builder instance, for method chaining
         */
        public Builder setExpirationDate(OffsetDateTime expirationDate) {
            card.expirationDate = expirationDate;
            return this;
        }

        /**
         * Set the due date of the Card under construction
         *
         * @param dueDate the Card's due date, assumed to be an ISO-8601 compliant datetime
         * @return this Builder instance, for method chaining
         */
        public Builder setDueDate(OffsetDateTime dueDate) {
            card.dueDate = dueDate;
            return this;
        }

        /**
         * Set the URL of the template of the Card under construction.
         *
         * @param href the Card's template URL
         * @return this Builder instance, for method chaining
         */
        public Builder setTemplate(String href) {
            card.template = new Link(href);
            return this;
        }

        /**
         * Set connector image link.
         *
         * @param href connector image url.
         * @return this Builder instance, for method chaining
         */
        public Builder setImageUrl(String href) {
            card.image = new Link(href);
            return this;
        }

        /**
         * Set the header of the Card under construction.
         *
         * @param header The card's header
         * @return this Builder instance, for method chaining
         */
        public Builder setHeader(CardHeader header) {
            card.header = header;
            return this;
        }

        /**
         * Set the header of the Card under construction, using the title and subtitle provided to create
         * a CardHeader object. This is just a convenience wrapper around <code>setHeader(CardHeader header)</code>.
         * <p>
         * If the Card is not intended to have both a title and a subtitle, it is recommended to supply
         * <code>null</code> for the missing values.
         *
         * @param title    the Card's header title
         * @param subtitle the Card's header subtitle(s)
         * @return this Builder instance, for method chaining
         */
        public Builder setHeader(String title, String... subtitle) {
            return setHeader(new CardHeader(title, subtitle == null ? null : Arrays.asList(subtitle), null));
        }

        /**
         * Set the banner of the Card under construction.
         *
         * @param banner The card's banner
         * @return this Builder instance, for method chaining
         */
        public Builder setBanner(CardBanner banner) {
            card.banner = banner;
            return this;
        }

        /**
         * Set the body of the Card under construction.
         *
         * @param somebody body to be added to the Card
         * @return this Builder instance, for method chaining
         */
        public Builder setBody(CardBody somebody) {
            card.body = somebody;
            return this;
        }

        /**
         * Set the body of the Card under construction, using the supplied description to create a CardBody
         * containing the description and no other content.
         * <p>
         * Do not use this method to create the card's body if you intend to populate the body's timestamp
         * or fields; use the CardBody.Builder class to create the body, and then add it to the Card with
         * <code>setBody(CardBody somebody)</code>.
         *
         * @param description A description to be used to populate a CardBody for the Card
         * @return this Builder instance, for method chaining
         */
        public Builder setBody(String description) {
            CardBody.Builder bodyBuilder = new CardBody.Builder();
            bodyBuilder.setDescription(description);
            return setBody(bodyBuilder.build());
        }


        /**
         * Add an action to the Card under construction.
         * Action are kept in the order in which they are added.
         *
         * @param action the new action to be added to the Card
         * @return this Builder instance, for method chaining
         */
        public Builder addAction(CardAction action) {
            card.actions.add(action);
            return this;
        }

        /**
         * Add an openInLink to the Card under construction.
         * openInLink are kept in the order in which they are added.
         *
         * @param openInLink the new openInLink to be added to the Card
         * @return this Builder instance, for method chaining
         */
        public Builder addLinks(OpenInLink openInLink) {
            card.links.add(openInLink);
            return this;
        }

        /**
         * Add a tag to the Card under construction.
         *
         * @param tag the new tag to be added to the Card
         * @return this Builder instance, for method chaining
         */
        public Builder addTag(String tag) {
            card.tags.add(tag);
            return this;
        }

        /**
         * Set the backend id of a card.
         *
         * @param backendId backend id of a card.
         * @return this Builder instance, for method chaining
         */
        public Builder setBackendId(String backendId) {
            card.backendId = backendId;
            return this;
        }

        /**
         * Set card's hash.
         *
         * @param hash the hash of the relevant card data.
         * @return this Builder instance, for method chaining
         */
        public Builder setHash(String hash) {
            card.hash = hash;
            return this;
        }

        /**
         * Return the Card under construction and reset the Builder to its initial state.
         *
         * @return The completed Card
         */
        @SuppressWarnings("PMD.UnnecessaryLocalBeforeReturn")
        public Card build() {
            // If the connector author has already set the hash, then do not override.
            if (StringUtils.isBlank(card.hash)) {
                card.hash = computeHash();
            }

            Card completedCard = this.card;
            reset();
            return completedCard;
        }

        @SuppressWarnings("PMD")
        public String computeHash() {
            final String templateUrl = card.template == null ? null : card.template.getHref();
            final String imageUrl = card.image == null ? null : card.image.getHref();

            final List<String> actionHashList = new ArrayList<>();
            if (!CollectionUtils.isEmpty(card.actions)) {
                card.actions.forEach(cardAction ->
                        actionHashList.add(cardAction == null ? StringUtils.SPACE : cardAction.hash())
                );
            }
            final List<String> linksHashList = new ArrayList<>();
            card.links.forEach(openInLink -> linksHashList.add(openInLink.hash()));

            final List<String> tagList = CollectionUtils.isEmpty(card.tags) ? Collections.EMPTY_LIST : new ArrayList<>(card.tags);
            final String headerHash = card.header == null ? null : card.header.hash();
            final String bannerHash = card.banner == null ? null : card.banner.hash();
            final String bodyHash = card.body == null ? null : card.body.hash();
            final String stickyHash = card.sticky == null ? null : card.sticky.hash();

            return HashUtil.hash(
                    "sticky: ", stickyHash,
                    "name: ", card.name,
                    "backend_id: ", card.backendId,
                    "template: ", templateUrl,
                    "header: ", headerHash,
                    "banner: ", bannerHash,
                    "body: ", bodyHash,
                    "actions: ", HashUtil.hashList(actionHashList),
                    "image: ", imageUrl,
                    "importance: ", card.importance,
                    "tags: ", HashUtil.hashList(tagList),
                    "links: ", HashUtil.hashList(linksHashList)
            );
        }
    }
}
