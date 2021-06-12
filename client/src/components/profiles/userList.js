import React from "react";
import { Link } from 'react-router-dom';
import {Button, Card, Table} from "antd";
import 'antd/dist/antd.css'




class ResetFilter extends React.Component {
  constructor (props) {
    super (props)
   
  }
 
  state = {
    filteredInfo: null,
    sortedInfo: null,
  };
  handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  };
  clearFilters = () => {
    this.setState({filteredInfo: null});
  };
  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
    });
  };
  setAgeSort = () => {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'age',
      },
    });
  };

  render() {
    const {profiles}=this.props;
    const data2 = profiles.map(row => ({
      key: row.user._id,
      name: row.user.name,
      status:row.status,
      company:row.company,
      location:row.location,
      skills:row.skills.slice(0,4).map((skill,index)=>( <li key={index} className='text-primary'>
      <i className='fas fa-check'></i> {skill}
    </li>)),
      ImageURL:row.user.avatar,
      _id:row.user._id
    
    }))
  {console.log("dara2",data2)}
    let {sortedInfo, filteredInfo} = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [
      {
        title: "",
        fixed:"center",
        dataIndex: "ImageURL",  // this is the value that is parsed from the DB / server side
        render: theImageURL => <img alt={theImageURL} src={theImageURL} style={{borderRadius:1000}}/>  // 'theImageURL' is the variable you must declare in order the render the URL
  },
      {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
     
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
   
     {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      
    }, {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
     
     
    },
    {
      title: 'Skills',
      dataIndex: 'skills',
      key: 'skills',
     
     
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
     
     
    },
    {
      title: 'View Profile',
      dataIndex:'_id',
      key: 'operation',
      fixed: 'right',
     
      render: (_id) => <Link to={`/profile/${_id}`} className='btn btn-primary medium' >
      View Profile
    </Link>,
    },];
    return (
      <Card >
      
        <Table className="gx-table-responsive" columns={columns} dataSource={data2} onChange={this.handleChange} width='100%'/>
      </Card>
    );
  }
}

export default ResetFilter;
