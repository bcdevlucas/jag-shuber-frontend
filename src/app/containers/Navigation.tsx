import { connect } from 'react-redux';

import { RootState } from '../store';
import { getCurrentUserToken, getCurrentUser, currentUserRoleScopes } from '../modules/user/selectors';
import { getAllUsers, getUserByAuthId } from '../modules/users/selectors';

import Navigation, { NavigationStateProps, NavigationProps } from '../components/Navigation';

import { IdType } from '../api';

const mapStateToProps = (state: RootState) => {
    return {
        currentUserRoleScopes: currentUserRoleScopes(state),
        currentUserToken: getCurrentUserToken(state),
        currentUser: getCurrentUser(state),
        getUserByAuthId: (userAuthId: IdType) => getUserByAuthId(userAuthId)(state)
    };
};

export default connect<NavigationStateProps, {}, NavigationProps>(mapStateToProps)(Navigation);
