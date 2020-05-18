import React from 'react';
import { Col, Nav, NavItem, Row, Tab } from 'react-bootstrap';

import PageTitle from '../../containers/PageTitle';

export default (props: any) => {
    const {
        sectionPlugins,
        pluginsWithErrors,
        handleSelectSection,
        renderPlugin
    } = props;

    let {
       selectedSection
    } = props;

    const leaveTypesPlugin = sectionPlugins
        .find((p: any) => p.name === 'ADMIN_PLUGIN_LEAVE_TYPES');

    const trainingTypes = sectionPlugins
        .find((p: any) => p.name === 'ADMIN_PLUGIN_TRAINING_TYPES');

    // TODO: Fix me! This console log should explain exactly what's going on...
    // console.log('WorkSectionsLayout selectedSection: ' + selectedSection);

    const validSections = ['ADMIN_PLUGIN_LEAVE_TYPES', 'ADMIN_PLUGIN_TRAINING_TYPES'];
    selectedSection = (validSections.indexOf(selectedSection) > -1) ? selectedSection : 'ADMIN_PLUGIN_LEAVE_TYPES';

    return (
        <Tab.Container
            id="profile-sections" // TODO: Change this ID!
            onSelect={(key: any) => handleSelectSection(key)}
            activeKey={selectedSection}
            key={selectedSection}
        >
            <Row className="clearfix">
                <Col sm={12}>
                    <Tab.Content animation={false}>
                        <Tab.Pane key={'ADMIN_PLUGIN_LEAVE_TYPES'} eventKey={'ADMIN_PLUGIN_LEAVE_TYPES'}>
                            <Row className="clearfix">
                                <Col sm={12} lg={6} lgPush={3}>
                                    <PageTitle title={({}: any) => `Leave Types`} />
                                    {leaveTypesPlugin && renderPlugin(leaveTypesPlugin)}
                                </Col>
                            </Row>
                        </Tab.Pane>
                        <Tab.Pane key={'ADMIN_PLUGIN_TRAINING_TYPES'} eventKey={'ADMIN_PLUGIN_TRAINING_TYPES'}>
                            <Row className="clearfix">
                                <Col sm={12} lg={6} lgPush={3}>
                                    <PageTitle title={({}: any) => `Training Types`} />
                                    {trainingTypes && renderPlugin(trainingTypes)}
                                </Col>
                            </Row>
                        </Tab.Pane>
                    </Tab.Content>
                </Col>
            </Row>
        </Tab.Container>
    );
};
