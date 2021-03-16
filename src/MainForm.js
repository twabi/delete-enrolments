import React, {useEffect, useState} from "react";
import "mdbreact/dist/css/mdb.css";
import {
    MDBBox,
    MDBBtn,
    MDBCard,
    MDBCardBody,
    MDBCardText,
    MDBCardTitle,
    MDBCol,
    MDBContainer, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader,
    MDBRow,
} from "mdbreact";
import {Button, Dropdown, Menu, TreeSelect} from "antd";
import Select from "react-select";
import {getInstance} from "d2";
import {DownOutlined} from "@ant-design/icons";
import Header from "@dhis2/d2-ui-header-bar"


const MainForm = (props) => {

    var orgUnitFilters = ["Filter By", "Markets"];
    const basicAuth = "Basic " + btoa("ahmed:Atwabi@20");

    const [showLoading, setShowLoading] = useState(false);
    const [orgUnits, setOrgUnits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [searchValue, setSearchValue] = useState();
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [orgFilter, setOrgFilter] = useState(orgUnitFilters[0]);
    const [choseFilter, setChoseFilter] = useState(false);
    const [treeMarkets, setTreeMarkets] = useState(null);
    const [treeValue, setTreeValue] = useState();
    const [flattenedUnits, setFlattenedUnits] = useState([]);
    const [D2, setD2] = useState();
    const [modal, setModal] = useState(false);
    const [alertModal, setAlertModal] = useState(false);
    const [message, setMessage] = useState("");
    const [messageBody, setMessageBody] = useState("");
    const [enrolArray, setEnrolArray] = useState([]);

    getInstance().then(d2 =>{
        setD2(d2);
    });

    const toggle = () => {
        setModal(!modal)
    }

    const toggleAlert = () => {
        setAlertModal(!alertModal);
    }

    useEffect(() => {
        setOrgUnits(props.organizationalUnits);
        setPrograms(props.programs);
        setTreeMarkets(props.treeMarkets);

    },[props.organizationalUnits, props.programs, props.d2, props.marketOrgUnits, props.treeMarkets]);


    const handle = (value, label, extra) => {
        setSearchValue(value)
    };

    const onSelect = (value, node) => {
        //setSelectedOrgUnit(node);

        var children = extractChildren(node)
        var tempArray = [];
        if(children === undefined){
            tempArray.push(node);
            setFlattenedUnits(tempArray)
        } else {
            let flat = flatten(extractChildren(node), extractChildren, node.level, node.parent)
                .map(x => delete x.children && x);
            //console.log(flat)
            setFlattenedUnits(flat);
        }
    };

    let extractChildren = x => x.children;
    let flatten = (children, getChildren, level, parent) => Array.prototype.concat.apply(
        children && children.map(x => ({ ...x, level: level || 1, parent: parent || null })),
        children && children.map(x => flatten(getChildren(x) || [], getChildren, (level || 1) + 1, x.id))
    );

    const handleTree = (value, label, extra) => {
        setTreeValue(value)
        //console.log(value);
    };

    const onSelectTree = (value, node) => {
        //setOrgUnit(selectedOrgUnit => [...selectedOrgUnit, node]);
        //setSelectedOrgUnit(node);
        console.log(node);

        var children = extractChildren(node);

        if(children === undefined){
            setFlattenedUnits([node]);
        } else {
            let flat = flatten(extractChildren(node), extractChildren, node.level, node.parent)
                .map(x => delete x.children && x);
            //console.log(flat)
            setFlattenedUnits(flat);
        }
    };

    const handleProgram = selectedOption => {
        console.log(selectedOption);
        setSelectedProgram(selectedOption);

    };

    const deleteEnrolment = (enrol) => {

        var enrolID = enrol.enrollment;
        console.log(enrolID);
        fetch(`https://covmw.com/namistest/api/enrollments/${enrolID}`, {
            method: 'DELETE',
            headers: {
                'Authorization' : basicAuth,
                'Content-type': 'application/json',
            },
            credentials: "include"

        })
            .then(response => response.json())
            .then((result) => {
                console.log(result);
                setMessage("Success");
                setMessageBody("The enrollments for the chosen program and orgUnits were successfully deleted");
                toggleAlert();
            })
            .catch((error) => {
                setMessage("Error");
                setMessageBody("Unable to delete due to an error: " + error)
                toggleAlert();
            });
    }

    const functionWithPromise = enrol => { //a function that returns a promise

        deleteEnrolment(enrol);
        return message;
    }

    const anAsyncFunction = async item => {
        return functionWithPromise(item)
    }

    const deleteData = async (list) => {
        return await Promise.all(list.map(item => anAsyncFunction(item)))
    }

    const handleDeletion = () => {
        toggle();
        //setShowLoading(true);
        //var progID = selectedProgram.id;
        console.log(flattenedUnits)
        //console.log(progID);

        if(flattenedUnits.length !== 0  && selectedProgram !== null){
            var programID = selectedProgram.id;

            var enrollments = [];

            flattenedUnits.map((unit) => {
                getInstance()
                    .then((d2) => {
                        const endpoint = `enrollments.json?ou=${unit.id}&program=${programID}&fields=enrollment`;
                        d2.Api.getApi().get(endpoint)
                            .then((response) => {
                                console.log(response.enrollments);
                                enrollments = enrollments.concat(response.enrollments);
                                //setEnrolArray(enrolArray => [...enrolArray, response.enrollments]);
                            })
                            .then(() => {
                                console.log(enrollments);
                                if(enrollments.length == 0){
                                    setMessage("Alert");
                                    setMessageBody("Unable to delete! No enrolments found for the chosen program or orgUnit.");
                                    toggleAlert();
                                }
                                deleteData(enrollments).then((r) =>{
                                    setShowLoading(false);
                                }).catch((err) => {
                                    console.log("an error occurred: " + err);
                                });
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }).then(() => {

                    });
            });

            //console.log(enrollments);


            /*
            */
        } else {
            console.log("things are null");
        }


    }


    const handleOrgFilter = (value) => {
        setOrgFilter(value);
        if(value === "Markets"){
            setChoseFilter(true);
            setFlattenedUnits([]);
            //setSelectedOrgUnit(null)
            setSearchValue(null);
            setTreeValue(null);
        } else {
            setChoseFilter(false);
            setFlattenedUnits([]);
            //setSelectedOrgUnit(null)
            setSearchValue(null);
            setTreeValue(null);
        }
    }


    const orgUnitMenu = (
        <Menu>
            {orgUnitFilters.map((item, index) => (
                <Menu.Item key={index} onClick={()=>{handleOrgFilter(item)}}>
                    {item}
                </Menu.Item>
            ))}
        </Menu>
    );


    return (
        <div>
            {D2 && <Header className="mb-5" d2={D2}/>}
                <MDBBox className="mt-5" display="flex" justifyContent="center" >
                    <MDBCol className="mb-5 mt-5" md="10">
                        <MDBCard display="flex" justifyContent="center" className="text-xl-center w-100">
                            <MDBCardBody>
                                <MDBCardTitle>
                                    <strong>Delete Enrolments</strong>
                                </MDBCardTitle>

                                <MDBCardText>
                                    <strong>Select Enrolment Program and Org Unit(s)</strong>
                                </MDBCardText>

                                {programs.length == 0 ? <div className="spinner-border mx-2 indigo-text spinner-border-sm" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div> : null}

                                <MDBContainer>
                                    <MDBModal isOpen={modal} toggle={toggle} centered>
                                        <MDBModalHeader toggle={toggle}>Confirmation</MDBModalHeader>
                                        <MDBModalBody>
                                            All the enrollments for the chosen orgUnit(and it's children) will be deleted.
                                            Are you sure you want to delete?
                                        </MDBModalBody>
                                        <MDBModalFooter>
                                            <MDBBtn color="secondary" className="mx-1" onClick={toggle}>Cancel</MDBBtn>
                                            <MDBBtn color="primary" className="mx-1" onClick={handleDeletion}>Delete</MDBBtn>
                                        </MDBModalFooter>
                                    </MDBModal>
                                </MDBContainer>

                                <MDBContainer>
                                    <MDBModal isOpen={alertModal} toggle={toggleAlert} centered>
                                        <MDBModalHeader toggle={toggleAlert}>{message}</MDBModalHeader>
                                        <MDBModalBody>
                                            {messageBody}
                                        </MDBModalBody>
                                    </MDBModal>
                                </MDBContainer>

                                <hr/>

                                <MDBContainer className="pl-5 mt-3">
                                    <MDBRow>
                                        <MDBCol>
                                            <div className="text-left my-3">
                                                <label className="grey-text ml-2">
                                                    <strong>Select Program</strong>
                                                </label>
                                                <Select
                                                    className="mt-2"
                                                    onChange={handleProgram}
                                                    options={programs}
                                                />
                                            </div>
                                        </MDBCol>
                                        <MDBCol>

                                            <div className="text-left my-3">
                                                <label className="grey-text ml-2">
                                                    <strong>Select Organization Unit</strong>
                                                    <Dropdown overlay={orgUnitMenu} className="ml-3">
                                                        <Button size="small">{orgFilter} <DownOutlined /></Button>
                                                    </Dropdown>
                                                </label>

                                                {choseFilter ?
                                                    <TreeSelect
                                                        style={{ width: '100%' }}
                                                        value={treeValue}
                                                        className="mt-2"
                                                        dropdownStyle={{ maxHeight: 400, overflow: 'auto'}}
                                                        treeData={treeMarkets}
                                                        allowClear
                                                        size="large"
                                                        placeholder="Please select organizational unit"
                                                        onChange={handleTree}
                                                        onSelect={onSelectTree}
                                                        showSearch={true}
                                                    />
                                                    :
                                                    <TreeSelect
                                                        style={{ width: '100%' }}
                                                        value={searchValue}
                                                        className="mt-2"
                                                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                                        treeData={orgUnits}
                                                        allowClear
                                                        size="large"
                                                        placeholder="Please select organizational unit"
                                                        onChange={handle}
                                                        onSelect={onSelect}
                                                        showSearch={true}
                                                    />

                                                }

                                            </div>
                                        </MDBCol>
                                    </MDBRow>

                                    <MDBRow className="mt-4">

                                    </MDBRow>

                                </MDBContainer>

                                <div className="text-center py-4 mt-2">

                                    <MDBBtn color="cyan" className="text-white" onClick={toggle}>
                                        Delete Enrolments{showLoading ? <div className="spinner-border mx-2 text-white spinner-border-sm" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div> : null}
                                    </MDBBtn>
                                </div>

                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBBox>
        </div>
    )
}

export default MainForm;