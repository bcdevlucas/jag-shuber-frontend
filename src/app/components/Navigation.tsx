/**
 * TODO: We're using hard coded app and auth scopes in here! Not really any way around that for now (unless we implement a menu builder)
 * so if you update the plugins or the app and auth scopes make sure you update this file!
 */

import React from 'react';
import { Dispatch } from 'redux';
import {
    Nav,
    Navbar,
    NavbarBrand,
    NavDropdown,
    Dropdown,
    MenuItem,
    Badge,
    Glyphicon,
    Image, Button
} from 'react-bootstrap';

import NavigationLink from './NavigationLink';
import LocationSelector from '../containers/NavLocationSelector';
import bcLogo from '../assets/images/bc-logo-transparent-no-underline.png';
import bcLogoDark from '../assets/images/bc-logo-transparent-dark.png';
import NavigationDropDown from './NavigationDropDown';
import avatarImg from '../assets/images/avatar.png';
import SheriffRankDisplay from '../containers/SheriffRankDisplay';
import SheriffDisplay from '../containers/SheriffDisplay';

import { TokenPayload } from 'jag-shuber-api';
import { IdType, User, Sheriff, DaysOfWeek } from '../api';

import { getCurrentUser } from '../modules/user/actions';
// import * as TimeUtils from '../infrastructure/TimeRangeUtils';

import { userHasBasicAuth } from '../plugins/permissionUtils';

export interface NavigationStateProps {
    getUserByAuthId?: (userAuthId: IdType) => any;
}

export interface NavigationDispatchProps {
    dispatch?: Dispatch<any>;
}

export interface NavigationProps extends NavigationDispatchProps {
    currentUserRoleScopes?: any;
    currentUserToken?: TokenPayload;
    currentUser?: User;
    onLogoutClicked?: any;
}

interface NavigationState {
    menuIsActive?: boolean;
}

export default class Navigation extends React.Component<NavigationProps & NavigationStateProps> {
    static Routes = {
        dutyRoster: {
            timeline: {
                path: '/',
                label: 'Duty Roster'
            },
            setup: {
                path: '/assignments/manage/default',
                label: 'Set-up'
            }
        },
        schedule: {
            manage: {
                path: '/sheriffs/schedule',
                label: 'Manage Schedule'
            },
            distribute: {
                path: '/schedule/publishView',
                label: 'Distribute Schedule'
            }
        },
        assignment: {
            path: '/assignments/manage/add',
            label: 'Add Assignment'
        },
        team: {
            path: '/sheriffs/manage',
            label: 'My Team', // TODO: Switch between 'Manage' and 'My' prefix depending on the role...
            children: {
                team: {
                    path: '/team',
                    label: 'My Team Members'
                },
                users: {
                    path: '/users/manage',
                    label: 'Find / Manage Users'
                },
                roles: {
                    path: '/roles/manage',
                    label: 'Define Roles & Access'
                },
                userRoles: {
                    path: '/roles/assign',
                    label: 'Assign User Roles'
                }
            }
        },
        types: {
            path: '#',
            label: 'Manage Types',
            children: {
                leaveTypes: {
                    path: '/codes/manage',
                    label: 'Leave & Training Types'
                },
                assignmentTypes: {
                    path: '/assignmentTypes/manage',
                    label: 'Assignment Types'
                }
            }
        },
        system: {
            path: '#',
            label: 'System',
            children: {
                components: {
                    path: '/components/manage',
                    label: 'Define Components'
                },
                apis: {
                    path: '/apis/manage',
                    label: 'Define API Scopes'
                }
            }
        },
        audit: {
            path: '/audit',
            label: 'Audit Records'
        }
    };

    state: NavigationState = {
        menuIsActive: false
    };

    constructor(props: NavigationProps & NavigationStateProps) {
        super(props);

        this.toggleMenu.bind(this);
    }

    toggleMenu = (e: any) => {
        const { menuIsActive } = this.state;
        this.setState({ menuIsActive: !menuIsActive });
    }

    render() {
        const { menuIsActive } = this.state;

        const {
            // tslint:disable-next-line:no-shadowed-variable
            currentUserRoleScopes = {
                appScopes: {},
                authScopes: []
            },
            currentUser = {
                firstName: '',
                lastName: '',
                sheriffId: undefined
            } as User,
            onLogoutClicked = () => {
                console.log('No logout handler specified');
            }
        } = this.props;

        const userHasBasicAuthorization = userHasBasicAuth(currentUserRoleScopes);

        return (
            <div id="header-main" className={menuIsActive ? `menu-is-active` : ``}>
                <Navbar staticTop={true} fluid={true} style={{maxWidth: '93%'}}>
                    <Navbar.Header color="#003366">

                        <NavbarBrand color="#003366">
                            <span className="logo desktop-logo">
                                <img src={bcLogo}/>
                            </span>
                            Sheriff Scheduling System
                        </NavbarBrand>
                    </Navbar.Header>
                    <Nav bsStyle="tabs">
                        {userHasBasicAuthorization && (
                        <>
                            <NavigationDropDown title="Duty Roster" id="duty_roster_dropdown">
                                <NavigationLink exactMatch={true} {...Navigation.Routes.dutyRoster.timeline} />
                                <NavigationLink {...Navigation.Routes.dutyRoster.setup} />
                            </NavigationDropDown>
                            <NavigationLink {...Navigation.Routes.assignment} />
                            <NavigationDropDown title="Shift Schedule" id="schedule_dropdown">
                                <NavigationLink {...Navigation.Routes.schedule.manage} />
                                <NavigationLink {...Navigation.Routes.schedule.distribute} />
                            </NavigationDropDown>

                            <NavigationDropDown title={Navigation.Routes.team.label} id="admin_dropdown">
                                <NavigationLink {...Navigation.Routes.team.children.team} />
                                {currentUserRoleScopes.authScopes
                                && currentUserRoleScopes.authScopes.indexOf('users:manage') > -1 && (
                                    <NavigationLink {...Navigation.Routes.team.children.users} />
                                )}
                                {currentUserRoleScopes.authScopes
                                && currentUserRoleScopes.authScopes.indexOf('roles:manage') > -1 && (
                                    <>
                                        <NavigationLink {...Navigation.Routes.team.children.userRoles} />
                                        <NavigationLink {...Navigation.Routes.team.children.roles} />
                                    </>
                                )}
                            </NavigationDropDown>

                            {currentUserRoleScopes.authScopes
                            && currentUserRoleScopes.authScopes.indexOf('system:types') > -1 && (
                                <NavigationDropDown title={Navigation.Routes.types.label} id="types_dropdown">
                                    <NavigationLink {...Navigation.Routes.types.children.assignmentTypes} />
                                    <NavigationLink {...Navigation.Routes.types.children.leaveTypes} />
                                </NavigationDropDown>
                            )}

                            {currentUserRoleScopes.authScopes
                            && currentUserRoleScopes.authScopes.indexOf('system:scopes') > -1 && (
                                <NavigationDropDown title={Navigation.Routes.system.label} id="system_dropdown">
                                    <NavigationLink {...Navigation.Routes.system.children.components} />
                                    <NavigationLink {...Navigation.Routes.system.children.apis} />
                                </NavigationDropDown>
                            )}
                            {/*<NavigationLink {...Navigation.Routes.audit} />*/}
                        </>
                        )}
                    </Nav>
                    <Nav pullRight={true} style={{paddingTop: 13, paddingRight: 15}}>
                        <div className="flex-row-wrap">
                            <span className="logo mobile-logo">
                                <img src={bcLogo}/>
                            </span>
                            <LocationSelector.Current/>
                            <Dropdown id="user-profile-menu" className="">
                                <Dropdown.Toggle className="user-profile-menu-toggle btn-transparent">
                                    <Image
                                        style={{marginLeft: '30px'}}
                                        src={avatarImg}
                                        circle={true}
                                        width="32"
                                        height="32"
                                    />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {currentUser && currentUser.sheriff && (
                                        <SheriffDisplay
                                            sheriffId={currentUser.sheriffId}
                                            RenderComponent={({
                                                                  sheriff: {
                                                                      firstName = '',
                                                                      lastName = '',
                                                                      imageUrl = '',
                                                                      badgeNo = '',
                                                                      rankCode = ''
                                                                  } = currentUser.sheriff as Sheriff
                                                              }) => {
                                                return (
                                                    <div className="sheriff-profile-header">
                                                        {/* <Image
                                                        src={imageUrl ? imageUrl : avatarImg}
                                                        circle={true}
                                                        width="115"
                                                        height="115"
                                                    /> */}
                                                        <div style={{marginTop: 30, fontSize: 14}}>#{badgeNo}</div>
                                                        <div style={{fontWeight: 'bold', fontSize: 18}}>
                                                            {firstName.toUpperCase()} {lastName.toUpperCase()}
                                                        </div>
                                                        <div style={{fontSize: 14}}>
                                                            <SheriffRankDisplay code={rankCode} />
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                    )}
                                    <hr/>
                                    <MenuItem
                                        style={{textAlign: 'center'}}
                                        onClick={(e) => {
                                            onLogoutClicked();
                                        }}
                                    >
                                        Logout
                                    </MenuItem>
                                </Dropdown.Menu>
                            </Dropdown>
                            <div>
                                {/* Just a flex container so we don't stretch the button */}
                                <Button
                                    className={`menu-toggle`}
                                    bsStyle="transparent"
                                    bsSize="large"
                                    onClick={this.toggleMenu}
                                >
                                    <Glyphicon glyph="nav" />
                                </Button>
                            </div>

                        </div>
                    </Nav>
                </Navbar>
            </div>
        );

    }
}
