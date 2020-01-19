import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native';
import api from '../../services/api';

import {
    Container,
    Header,
    Avatar,
    Name,
    Bio,
    Starts,
    Starred,
    OwnerAvatar,
    Info,
    Title,
    Author,
} from './styles';

export default class User extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: navigation.getParam('user').name,
    });

    static propTypes = {
        navigation: PropTypes.shape({
            getParam: PropTypes.func,
        }).isRequired,
    };

    state = {
        stars: [],
        page: 1,
        loading: true,
        refreshing: false,
    };

    async componentDidMount() {
        this.load();
    }

    load = async (page = 1) => {
        console.tron.log('load page ', page);
        const { navigation } = this.props;
        const user = navigation.getParam('user');

        const response = await api.get(
            `/users/${user.login}/starred?page=${page}`
        );
        const { stars } = this.state;

        this.setState({
            stars: page >= 2 ? [...stars, ...response.data] : response.data,
            page,
            loading: false,
            refreshing: false,
        });
    };

    loadMore = () => {
        const { page } = this.state;
        const nextPage = page + 1;
        this.load(nextPage);
    };

    refreshList = () => {
        this.setState({
            page: 1,
            loading: true,
            refreshing: true,
        });

        this.load();
    };

    render() {
        const { navigation } = this.props;
        const { stars, loading, refreshing } = this.state;
        const user = navigation.getParam('user');

        return (
            <Container>
                <Header>
                    <Avatar source={{ uri: user.avatar }} />
                    <Name>{user.name}</Name>
                    <Bio>{user.bio}</Bio>
                </Header>
                {loading ? (
                    <ActivityIndicator color="#aaa" />
                ) : (
                    <Starts
                        data={stars}
                        keyExtractor={star => String(star.id)}
                        onEndReachedThreshold={0.5}
                        onEndReached={this.loadMore}
                        onRefresh={this.refreshList}
                        refreshing={refreshing}
                        renderItem={({ item }) => (
                            <Starred>
                                <OwnerAvatar
                                    source={{ uri: item.owner.avatar_url }}
                                />
                                <Info>
                                    <Title>{item.name}</Title>
                                    <Author>{item.owner.login}</Author>
                                </Info>
                            </Starred>
                        )}
                    />
                )}
            </Container>
        );
    }
}
