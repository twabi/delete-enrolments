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
    MDBContainer,
    MDBRow,
} from "mdbreact";
import {Button, Dropdown, Menu, TreeSelect} from "antd";
import Select from "react-select";
import {getInstance} from "d2";
import {DownOutlined} from "@ant-design/icons";
import Header from "@dhis2/d2-ui-header-bar"


const MainForm = (props) => {

    var periods = ["Choose By","Week", "Month"];
    var orgUnitFilters = ["Filter By", "Markets"];

    const [showLoading, setShowLoading] = useState(false);
    const [orgUnits, setOrgUnits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [markets, setMarkets] = useState([]);
    const [searchValue, setSearchValue] = useState();
    const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [headerNames, setHeaderNames] = useState([]);
    const [orgFilter, setOrgFilter] = useState(orgUnitFilters[0]);
    const [choseFilter, setChoseFilter] = useState(false);
    const [treeMarkets, setTreeMarkets] = useState(null);
    const [treeValue, setTreeValue] = useState();
    const [flattenedUnits, setFlattenedUnits] = useState([]);
    const [D2, setD2] = useState();
    getInstance().then(d2 =>{
        setD2(d2);
    })

    useEffect(() => {
        setOrgUnits(props.organizationalUnits);
        setPrograms(props.programs);
        setMarkets(props.marketOrgUnits);
        setTreeMarkets(props.treeMarkets);


    },[headerNames, props.organizationalUnits, props.programs, props.d2, props.marketOrgUnits, props.treeMarkets]);


    const handle = (value, label, extra) => {
        setSearchValue(value)
    };

    const onSelect = (value, node) => {
        //setOrgUnit(selectedOrgUnit => [...selectedOrgUnit, node]);
        setSelectedOrgUnit(node);
        //console.log(node);

        let extractChildren = x => x.children;
        let flat = flatten(extractChildren(node), extractChildren, node.level, node.parent)
            .map(x => delete x.children && x);
        console.log(flat)
        setFlattenedUnits(flat);

    };

    let flatten = (children, getChildren, level, parent) => Array.prototype.concat.apply(
        children.map(x => ({ ...x, level: level || 1, parent: parent || null })),
        children.map(x => flatten(getChildren(x) || [], getChildren, (level || 1) + 1, x.id))
    );

    const handleTree = (value, label, extra) => {
        setTreeValue(value)
        //console.log(value);
    };

    const onSelectTree = (value, node) => {
        //setOrgUnit(selectedOrgUnit => [...selectedOrgUnit, node]);
        setSelectedOrgUnit(node);
        console.log(node);

        //console.log(flatten())
        let extractChildren = x => x.children;
        let flat = flatten(extractChildren(node), extractChildren, node.level, node.parent)
            .map(x => delete x.children && x);
        console.log(flat)
        setFlattenedUnits(flat);
    };

    const handleDeletion = () => {
        var progID = selectedProgram.id;



    }



    const handleProgram = selectedOption => {

        console.log(selectedOption);

        getInstance().then((d2) => {
            const endpoint = `programs/${selectedOption.id}.json?fields=id,name,trackedEntityType[id,name]`;
            d2.Api.getApi().get(endpoint)
                .then((response) => {
                    console.log(response.trackedEntityType.name);
                    selectedOption.entityTypeName = response.trackedEntityType.name;
                    setSelectedProgram(selectedOption);
                })
                .catch((error) => {
                    console.log("An error occurred: " + error);
                    alert("An error occurred: " + error);
                });
        });

    };

    const functionWithPromise = eventItem => { //a function that returns a promise
        getInstance().then((d2) => {
            eventItem.dataValues.map((dataValue) => {
                const endpoint = `dataElements/${dataValue.dataElement}.json`;
                d2.Api.getApi().get(endpoint)
                    .then((response) => {
                        //console.log(dataValue);
                        //console.log(dataValue.dataElement);
                        var data = {"id" : response.id, "name" : response.displayFormName,
                            "trackedInstance" : eventItem.trackedEntityInstance};
                        dataValue.displayName = response.displayFormName;

                        setHeaderNames(headerName => [...headerName, data]);
                    })
                    .catch((error) => {
                        console.log("An error occurred: " + error);
                        alert("An error occurred: " + error);
                    });
            });

            //dataOver.dataValues = tempArray;
            //setHeaderNames(headerName => [...headerName, dataOver]);

        });


        return eventItem;
    }

    const anAsyncFunction = async item => {
        return functionWithPromise(item)
    }

    const getData = async (list) => {
        return await Promise.all(list.map(item => anAsyncFunction(item)))
    }


    const handleOrgFilter = (value) => {
        setOrgFilter(value);
        if(value === "Markets"){
            setChoseFilter(true);
            setFlattenedUnits([]);
            setSelectedOrgUnit(null)
            setSearchValue(null);
            setTreeValue(null);
        } else {
            setChoseFilter(false);
            setFlattenedUnits([]);
            setSelectedOrgUnit(null)
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

                                    <MDBBtn color="cyan" className="text-white">
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