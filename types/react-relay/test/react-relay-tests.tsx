import * as React from "react";
import { Environment, Network, RecordSource, Store, ConnectionHandler, FragmentReference } from "relay-runtime";

import {
    AbstractFragment,
    graphql,
    commitMutation,
    createFragmentContainer,
    createPaginationContainer,
    createRefetchContainer,
    requestSubscription,
    QueryRenderer,
    RelayRefetchProp,
    RelayPaginationProp,
} from "react-relay";

// ~~~~~~~~~~~~~~~~~~~~~
// Modern Environment
// ~~~~~~~~~~~~~~~~~~~~~
function fetchQuery(operation: any, variables: any, cacheConfig: {}) {
    return fetch("/graphql");
}
const network = Network.create(fetchQuery);
const source = new RecordSource();
const store = new Store(source);
const modernEnvironment = new Environment({ network, store });

// ~~~~~~~~~~~~~~~~~~~~~
// Modern QueryRenderer
// ~~~~~~~~~~~~~~~~~~~~~
const MyQueryRenderer = (props: { name: string }) => (
    <QueryRenderer
        environment={modernEnvironment}
        query={graphql`
            query ExampleQuery($pageID: ID!) {
                page(id: $pageID) {
                    name
                }
            }
        `}
        variables={{
            pageID: "110798995619330",
        }}
        render={({ error, props }) => {
            if (error) {
                return <div>{error.message}</div>;
            } else if (props) {
                return <div>{props.name} is great!</div>;
            }
            return <div>Loading</div>;
        }}
    />
);

// ~~~~~~~~~~~~~~~~~~~~~
// Modern FragmentContainer
// ~~~~~~~~~~~~~~~~~~~~~

() => {
    // relay-compiler artifact
    interface TodoItem_item {
        text: string;
        isComplete: boolean;
        __fragments: AbstractFragment;
    }

    interface Props {
        aRequiredProp: true;
        item: TodoItem_item;
    }

    class MyComponent extends React.Component<Props> {
        render() {
            return <div />;
        }
    }

    const MyFragmentContainer = createFragmentContainer(
        MyComponent,
        {
            item: graphql`
                fragment TodoItem_item on Todo {
                    text
                    isComplete
                }
            `,
        }
    );

    function shouldOnlyNeedToPassAbstractFragmentProps(item: AbstractFragment) {
        <MyFragmentContainer aRequiredProp={true} item={item} />;
    }

    function shouldAcceptFragmentProps(item: AbstractFragment) {
        <MyFragmentContainer aRequiredProp={true} item={item} />;
    }
};

// ~~~~~~~~~~~~~~~~~~~~~
// Modern RefetchContainer
// ~~~~~~~~~~~~~~~~~~~~~

() => {
    // relay-compiler artifact
    type Story_stories = ReadonlyArray<{
        title: string;
    }>;

    interface StoriesProps {
        aRequiredProp: true;
        stories: Story_stories;
    }

    class Stories extends React.Component<StoriesProps> {}

    const StoriesContainer = createFragmentContainer(Stories, {
        stories: graphql`
            fragment Story_stories on StoryEdge @relay(plural: true) {
                title
            }
        `
    });

    // relay-compiler artifact
    interface FeedStories_feed {
        stories: {
            edges: Array<{
                node: {
                    id: string;
                }
                __fragments: AbstractFragment;
            }>
        };
    }

    interface FeedStoriesProps {
        aRequiredProp: true;
        relay: RelayRefetchProp;
        feed: FeedStories_feed;
    }

    class FeedStories extends React.Component<FeedStoriesProps> {
        render() {
            return (
                <div>
                    <StoriesContainer stories={this.props.feed.stories.edges} aRequiredProp={true} />
                    <button onClick={() => this._loadMore} title="Load More" />
                </div>
            );
        }

        _loadMore() {
            // Increments the number of stories being rendered by 10.
            const refetchVariables = (fragmentVariables: { count: number }) => ({
                count: fragmentVariables.count + 10,
            });
            this.props.relay.refetch(refetchVariables);
        }
    }

    const FeedRefetchContainer = createRefetchContainer(
        FeedStories,
        {
            feed: graphql.experimental`
                fragment FeedStories_feed on Feed @argumentDefinitions(count: { type: "Int", defaultValue: 10 }) {
                    stories(first: $count) {
                        edges {
                            ...Story_stories
                            node {
                                id
                            }
                        }
                    }
                }
            `,
        },
        graphql.experimental`
            query FeedStoriesRefetchQuery($count: Int) {
                feed {
                    ...FeedStories_feed @arguments(count: $count)
                }
            }
        `
    );

    function shouldOnlyNeedToPassAbstractFragmentProps(feed: AbstractFragment) {
        <FeedRefetchContainer aRequiredProp={true} feed={feed} />;
    }
};

// ~~~~~~~~~~~~~~~~~~~~~
// Modern PaginationContainer
// ~~~~~~~~~~~~~~~~~~~~~

() => {
    // relay-compiler artifact
    interface Story_story {
        title: string;
    }

    interface StoryProps {
        aRequiredProp: true;
        story: Story_story;
    }

    class Story extends React.Component<StoryProps> {}

    const StoryContainer = createFragmentContainer(Story, graphql`
        fragment Story_story on Story {
            title
        }
    `);

    interface FeedProps {
        aRequiredProp: true;
        user: { feed: { edges: Array<{ node: { id: string } }> } };
        relay: RelayPaginationProp;
    }
    class Feed extends React.Component<FeedProps> {
        render() {
            return (
                <div>
                    {this.props.user.feed.edges.map(edge => {
                        return <StoryContainer aRequiredProp={true} story={edge.node as any} key={edge.node.id} />;
                    })}
                    <button onClick={() => this._loadMore()} title="Load More" />
                </div>
            );
        }

        _loadMore() {
            if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
                return;
            }

            this.props.relay.loadMore(
                10, // Fetch the next 10 feed items
                e => {
                    console.log(e);
                }
            );
        }
    }

    const FeedPaginationContainer = createPaginationContainer(
        Feed,
        graphql`
            fragment Feed_user on User {
                feed(
                    first: $count
                    after: $cursor
                    orderby: $orderBy # other variables
                ) @connection(key: "Feed_feed") {
                    edges {
                        node {
                            id
                            ...Story_story
                        }
                    }
                }
            }
        `,
        {
            direction: "forward",
            getConnectionFromProps(props) {
                return props.user && props.user.feed;
            },
            getFragmentVariables(prevVars, totalCount) {
                return {
                    ...prevVars,
                    count: totalCount,
                };
            },
            getVariables(props, { count, cursor }, fragmentVariables) {
                return {
                    count,
                    cursor,
                    // in most cases, for variables other than connection filters like
                    // `first`, `after`, etc. you may want to use the previous values.
                    orderBy: fragmentVariables.orderBy,
                };
            },
            query: graphql`
                query FeedPaginationQuery($count: Int!, $cursor: String, $orderby: String!) {
                    user {
                        # You could reference the fragment defined previously.
                        ...Feed_user
                    }
                }
            `,
        }
    );

    function shouldOnlyNeedToPassAbstractFragmentProps(user: AbstractFragment) {
        <FeedPaginationContainer aRequiredProp={true} user={user as any} />;
    }
};

// ~~~~~~~~~~~~~~~~~~~~~
// Modern Mutations
// ~~~~~~~~~~~~~~~~~~~~~
export const mutation = graphql`
    mutation MarkReadNotificationMutation($input: MarkReadNotificationData!) {
        markReadNotification(data: $input) {
            notification {
                seenState
            }
        }
    }
`;

export const optimisticResponse = {
    markReadNotification: {
        notification: {
            seenState: "SEEN",
        },
    },
};

export const configs = [
    {
        type: "NODE_DELETE" as "NODE_DELETE",
        deletedIDFieldName: "destroyedShipId",
    },
    {
        type: "RANGE_ADD" as "RANGE_ADD",
        parentID: "shipId",
        connectionInfo: [
            {
                key: "AddShip_ships",
                rangeBehavior: "append",
            },
        ],
        edgeName: "newShipEdge",
    },
    {
        type: "RANGE_DELETE" as "RANGE_DELETE",
        parentID: "todoId",
        connectionKeys: [
            {
                key: "RemoveTags_tags",
                rangeBehavior: "append",
            },
        ],
        pathToConnection: ["todo", "tags"],
        deletedIDFieldName: "removedTagId",
    },
];

function markNotificationAsRead(source: string, storyID: string) {
    const variables = {
        input: {
            source,
            storyID,
        },
    };

    commitMutation(modernEnvironment, {
        configs,
        mutation,
        optimisticResponse,
        variables,
        onCompleted: (response, errors) => {
            console.log("Response received from server.");
        },
        onError: err => console.error(err),
        updater: (store, data) => {
            const field = store.get(storyID);
            if (field) {
                field.setValue(data.story, "story");
            }
        }
    });
}

// ~~~~~~~~~~~~~~~~~~~~~
// Modern Subscriptions
// ~~~~~~~~~~~~~~~~~~~~~
const subscription = graphql`
    subscription MarkReadNotificationSubscription($storyID: ID!) {
        markReadNotification(storyID: $storyID) {
            notification {
                seenState
            }
        }
    }
`;
const variables = {
    storyID: "123",
};
requestSubscription(
    modernEnvironment, // see Environment docs
    {
        subscription,
        variables,
        // optional but recommended:
        onCompleted: () => {},
        onError: error => console.error(error),
        // example of a custom updater
        updater: store => {
            // Get the notification
            const rootField = store.getRootField("markReadNotification");
            const notification = !!rootField && rootField.getLinkedRecord("notification");
            // Add it to a connection
            const viewer = store.getRoot().getLinkedRecord("viewer");
            const notifications = ConnectionHandler.getConnection(viewer, "notifications");
            const edge = ConnectionHandler.createEdge(store, notifications, notification, "<TypeOfNotificationsEdge>");
            ConnectionHandler.insertEdgeAfter(notifications, edge);
        },
    }
);
